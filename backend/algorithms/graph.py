def bfs_steps(graph, start):
    steps = []
    visited = set()
    queue = [start]
    
    steps.append({'type': 'init', 'indices': [start], 'array': list(graph.keys()), 'line': 5, 'meta': {'queue': [start], 'visited': list(visited)}})
    
    while queue:
        node = queue.pop(0)
        if node not in visited and node in graph:
            visited.add(node)
            steps.append({'type': 'visit', 'indices': [node], 'array': list(graph.keys()), 'line': 10, 'meta': {'visited': list(visited), 'current': node, 'queue': queue.copy()}})
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    steps.append({'type': 'discover', 'indices': [neighbor], 'array': list(graph.keys()), 'line': 14, 'meta': {'from': node, 'to': neighbor, 'queue': queue.copy() + [neighbor], 'visited': list(visited)}})
                    queue.append(neighbor)
    
    steps.append({'type': 'complete', 'indices': [], 'array': list(graph.keys()), 'line': 18, 'meta': {'visited': list(visited)}})
    return steps

def dfs_steps(graph, start):
    steps = []
    visited = set()
    stack = [start]
    
    steps.append({'type': 'init', 'indices': [start], 'array': list(graph.keys()), 'line': 24, 'meta': {'stack': [start], 'visited': list(visited)}})
    
    while stack:
        node = stack.pop()
        if node not in visited and node in graph:
            visited.add(node)
            steps.append({'type': 'visit', 'indices': [node], 'array': list(graph.keys()), 'line': 30, 'meta': {'visited': list(visited), 'current': node, 'stack': stack.copy()}})
            
            neighbors = graph.get(node)
            if isinstance(neighbors, dict):
                for neighbor in list(neighbors.keys())[::-1]:  # Safe list slicing for all Python versions
                    if neighbor not in visited:
                        steps.append({'type': 'discover', 'indices': [neighbor], 'array': list(graph.keys()), 'line': 34, 'meta': {'from': node, 'to': neighbor, 'stack': stack.copy() + [neighbor], 'visited': list(visited)}})
                        stack.append(neighbor)
    
    steps.append({'type': 'complete', 'indices': [], 'array': list(graph.keys()), 'line': 38, 'meta': {'visited': list(visited)}})
    return steps

def dijkstra_steps(graph, start):
    steps = []
    
    # Collect all unique nodes in graph keys and values
    all_nodes = set(graph.keys())
    for neighbors in graph.values():
        if isinstance(neighbors, dict):
            all_nodes.update(neighbors.keys())
            
    distances = {node: float('inf') for node in all_nodes}
    parents = {node: None for node in all_nodes}
    if start not in distances:
        distances[start] = float('inf')
    distances[start] = 0
    visited = set()
    
    steps.append({'type': 'init', 'indices': [start], 'array': list(graph.keys()), 'line': 46, 'meta': {'distances': distances.copy(), 'parents': parents.copy(), 'visited': list(visited)}})
    
    while len(visited) < len(all_nodes):
        # Find unvisited node with smallest distance
        current = None
        for node in all_nodes:
            if node not in visited:
                if distances[node] < float('inf'):
                    if current is None or distances[node] < distances[current]:
                        current = node
        
        if current is None:
            # All remaining unvisited nodes are unreachable
            break
            
        visited.add(current)
        steps.append({'type': 'visit', 'indices': [current], 'array': list(graph.keys()), 'line': 58, 'meta': {'distances': distances.copy(), 'parents': parents.copy(), 'visited': list(visited), 'current': current}})
        
        neighbors = graph.get(current)
        if isinstance(neighbors, dict):
            for neighbor, weight in neighbors.items():
                if neighbor not in visited:
                    new_distance = distances[current] + float(weight)
                    if new_distance < distances.get(neighbor, float('inf')):
                        distances[neighbor] = new_distance
                        parents[neighbor] = current
                        steps.append({'type': 'update', 'indices': [neighbor], 'array': list(graph.keys()), 'line': 65, 'meta': {'distances': distances.copy(), 'parents': parents.copy(), 'from': current, 'to': neighbor, 'new_distance': new_distance}})
    
    steps.append({'type': 'complete', 'indices': [], 'array': list(graph.keys()), 'line': 69, 'meta': {'distances': distances, 'parents': parents, 'visited': list(visited)}})
    return steps

def prim_steps(graph, start):
    steps = []
    mst = []
    
    # Collect all unique nodes in graph keys and values
    all_nodes = set(graph.keys())
    for neighbors in graph.values():
        if isinstance(neighbors, dict):
            all_nodes.update(neighbors.keys())
            
    if start not in all_nodes:
        start = list(all_nodes)[0] if all_nodes else '0'
        
    visited = {start}
    edges = []

    # Add initial edges from the start node
    start_neighbors = graph.get(start)
    if isinstance(start_neighbors, dict):
        for neighbor, weight in start_neighbors.items():
            edges.append((float(weight), start, neighbor))
    
    steps.append({'type': 'init', 'indices': [start], 'array': list(graph.keys()), 'line': 80, 'meta': {'visited': list(visited), 'edges': edges.copy()}})

    while edges and len(visited) < len(all_nodes):
        # Get the edge with the minimum weight
        weight, u, v = min(edges, key=lambda x: x[0])
        edges.remove((weight, u, v))

        if v not in visited:
            visited.add(v)
            mst.append((u, v, weight))
            steps.append({'type': 'visit', 'indices': [v], 'array': list(graph.keys()), 'line': 90, 'meta': {'visited': list(visited), 'mst': mst.copy(), 'edge': (u, v, weight)}})

            # Add new edges from the newly visited node
            v_neighbors = graph.get(v)
            if isinstance(v_neighbors, dict):
                for neighbor, new_weight in v_neighbors.items():
                    if neighbor not in visited:
                        edges.append((float(new_weight), v, neighbor))
    
    steps.append({'type': 'complete', 'indices': [], 'array': list(graph.keys()), 'line': 98, 'meta': {'mst': mst}})
    return steps

def preorder_traversal_steps(tree, start):
    steps = []
    stack = [start]
    traversal = []

    steps.append({'type': 'init', 'indices': [start], 'array': list(tree.keys()), 'line': 105, 'meta': {'stack': [start], 'traversal': traversal}})

    while stack:
        node = stack.pop()
        if node is not None:
            traversal.append(node)
            steps.append({'type': 'visit', 'indices': [node], 'array': list(tree.keys()), 'line': 111, 'meta': {'traversal': list(traversal), 'current': node}})
            
            # Add children to stack in reverse order
            children = tree.get(node, [])
            for child in reversed(children):
                stack.append(child)
    
    steps.append({'type': 'complete', 'indices': [], 'array': list(tree.keys()), 'line': 118, 'meta': {'traversal': traversal}})
    return steps

def inorder_traversal_steps(tree, start):
    steps = []
    stack = []
    traversal = []
    current = start

    steps.append({'type': 'init', 'indices': [start], 'array': list(tree.keys()), 'line': 125, 'meta': {'stack': [start], 'traversal': traversal}})

    while stack or current is not None:
        while current is not None:
            stack.append(current)
            children = tree.get(current, [])
            current = children[0] if children else None

        if stack:
            current = stack.pop()
            traversal.append(current)
            steps.append({'type': 'visit', 'indices': [current], 'array': list(tree.keys()), 'line': 136, 'meta': {'traversal': list(traversal), 'current': current}})
            
            children = tree.get(current, [])
            current = children[1] if len(children) > 1 else None

    steps.append({'type': 'complete', 'indices': [], 'array': list(tree.keys()), 'line': 142, 'meta': {'traversal': traversal}})
    return steps

def postorder_traversal_steps(tree, start):
    steps = []
    stack = [start]
    traversal = []

    steps.append({'type': 'init', 'indices': [start], 'array': list(tree.keys()), 'line': 149, 'meta': {'stack': [start], 'traversal': traversal}})

    while stack:
        node = stack.pop()
        if node is not None:
            traversal.insert(0, node)
            steps.append({'type': 'visit', 'indices': [node], 'array': list(tree.keys()), 'line': 155, 'meta': {'traversal': list(traversal), 'current': node}})
            
            children = tree.get(node, [])
            for child in children:
                stack.append(child)

    steps.append({'type': 'complete', 'indices': [], 'array': list(tree.keys()), 'line': 161, 'meta': {'traversal': traversal}})
    return steps

# Sample graph for testing
def get_sample_graph():
    return {
        0: {1: 4, 2: 1},
        1: {3: 1},
        2: {1: 2, 3: 5},
        3: {}
    }

# Sample tree for testing
def get_sample_tree():
    return {
        'A': ['B', 'C'],
        'B': ['D', 'E'],
        'C': ['F'],
        'D': [],
        'E': [],
        'F': []
    }