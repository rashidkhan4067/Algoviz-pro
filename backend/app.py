from flask import Flask, request, jsonify, send_from_directory
from sqlalchemy.exc import IntegrityError
import os
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

from algorithms import bubble, merge, quick, search, graph, dp
import random

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__, instance_path=os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance')))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

def _stringify_keys(obj):
    """Recursively convert dict keys to strings so JSON encoder won't try
    to sort mixed-type keys (int vs str) and raise TypeError.
    Leaves list/primitive values intact, but walks into nested structures.
    """
    if isinstance(obj, dict):
        new = {}
        for k, v in obj.items():
            new[str(k)] = _stringify_keys(v)
        return new
    if isinstance(obj, list):
        return [_stringify_keys(v) for v in obj]
    return obj

ALGORITHMS = {
    # Sorting algorithms
    'bubble': bubble.bubble_sort,
    'merge': merge.merge_sort_steps,
    'quick': quick.quick_sort_steps,
    
    # Search algorithms
    'linear': search.linear_search_steps,
    'binary': search.binary_search_steps,
    
    # Graph algorithms
    'bfs': graph.bfs_steps,
    'dfs': graph.dfs_steps,
    'dijkstra': graph.dijkstra_steps,
    'prim': graph.prim_steps,
    
    # Tree traversal
    'preorder': graph.preorder_traversal_steps,
    'inorder': graph.inorder_traversal_steps,
    'postorder': graph.postorder_traversal_steps,
    
    # DP algorithms
    'fibonacci': dp.fibonacci_steps,
    'knapsack': dp.knapsack_steps,
}

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        # In case of a race condition or unexpected duplicate, rollback and respond gracefully
        db.session.rollback()
        return jsonify({"msg": "User already exists"}), 400

    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad email or password"}), 401

@app.route('/api/algorithm/<name>', methods=['POST'])
def get_algorithm_steps(name):
    data = request.get_json() or {}
    # Accept raw arrays in the request body (frontend may POST an array directly).
    # Normalize to a dict so later `data.get(...)` calls are safe.
    if isinstance(data, list):
        data = {'array': data}
    
    alg = ALGORITHMS.get(name)
    if not alg:
        return jsonify({'error': 'algorithm not found'}), 404
    
    # Handle different algorithm types
    if name in ['bubble', 'merge', 'quick']:
        # Sorting algorithms - need array
        arr = data.get('array')
        if not arr:
            size = int(data.get('size', 8))
            arr = [random.randint(1, 100) for _ in range(size)]
        steps = alg(list(arr))
        return jsonify({'array': arr, 'steps': steps})
    
    elif name in ['linear', 'binary']:
        # Search algorithms - need array and target
        arr = data.get('array')
        if not arr:
            size = int(data.get('size', 8))
            arr = [random.randint(1, 100) for _ in range(size)]
        target = data.get('target', max(arr) if arr else 42)
        steps = alg(list(arr), target)
        return jsonify({'array': arr, 'steps': steps, 'target': target})
    
    elif name in ['bfs', 'dfs', 'dijkstra', 'prim']:
        # Graph algorithms - need graph and start node
        graph_data = data.get('graph', graph.get_sample_graph())
        start = data.get('start', 0)
        
        # Normalize graph keys and neighbors to string keys and numeric weights
        normalized_graph = {}
        for u, neighbors in graph_data.items():
            normalized_neighbors = {}
            for v, w in neighbors.items():
                normalized_neighbors[str(v)] = float(w)
            normalized_graph[str(u)] = normalized_neighbors

        # Ensure start node matches string keys
        start = str(start)
        if start not in normalized_graph:
            # Fallback to the first available key in the graph
            start = list(normalized_graph.keys())[0] if normalized_graph else '0'

        steps = alg(normalized_graph, start)
        # Ensure all dict keys are strings so JSON encoding doesn't fail
        steps_conv = _stringify_keys(steps)
        graph_conv = _stringify_keys(normalized_graph)
        return jsonify({'steps': steps_conv, 'graph': graph_conv, 'start': start})

    elif name in ['preorder', 'inorder', 'postorder']:
        # Tree traversal algorithms
        tree_data = data.get('tree', graph.get_sample_tree())
        start = data.get('start', 'A')
        
        # Normalize tree keys and children
        normalized_tree = {}
        for u, children in tree_data.items():
            normalized_tree[str(u)] = [str(c) for c in children] if children else []

        start = str(start)
        if start not in normalized_tree:
            start = list(normalized_tree.keys())[0] if normalized_tree else 'A'

        steps = alg(normalized_tree, start)
        return jsonify({'steps': steps, 'tree': normalized_tree, 'start': start})
    
    elif name == 'fibonacci':
        # Fibonacci DP algorithm - need n
        n = data.get('n', 6)
        steps = alg(n)
        return jsonify({'steps': steps, 'n': n})
    
    elif name == 'knapsack':
        # Knapsack DP algorithm - need weights, values, capacity
        weights = data.get('weights', [2, 3, 4, 5])
        values = data.get('values', [3, 4, 5, 6])
        capacity = data.get('capacity', 5)
        steps = alg(weights, values, capacity)
        return jsonify({'steps': steps, 'weights': weights, 'values': values, 'capacity': capacity})
    
    else:
        return jsonify({'error': 'algorithm not supported'}), 400


@app.route('/api/ping')
def ping():
    return jsonify({'status':'ok'})


# Serve development-only sound file from backend static directory
@app.route('/sound/ping.mp3')
def serve_ping_sound():
    sound_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'static', 'sound'))
    filename = 'happy-message-ping-351298.mp3'
    return send_from_directory(sound_dir, filename)


if __name__ == '__main__':
    # For development: ensure database tables exist so registration/login work
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        # If DB initialization fails, log but continue so developer can see the error
        print('Warning: failed to create DB tables automatically:', e)

    app.run(host='0.0.0.0', port=5000, debug=True)