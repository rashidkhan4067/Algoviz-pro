def fibonacci_steps(n):
    steps = []
    dp = [0] * (n + 1)
    
    steps.append({'type': 'init', 'indices': [], 'array': dp.copy(), 'line': 4, 'meta': {'n': n, 'dp_table': dp.copy()}})
    
    if n >= 0:
        dp[0] = 0
        steps.append({'type': 'base_case', 'indices': [0], 'array': dp.copy(), 'line': 8, 'meta': {'index': 0, 'value': 0}})
    
    if n >= 1:
        dp[1] = 1
        steps.append({'type': 'base_case', 'indices': [1], 'array': dp.copy(), 'line': 12, 'meta': {'index': 1, 'value': 1}})
    
    for i in range(2, n + 1):
        steps.append({'type': 'calculate', 'indices': [i], 'array': dp.copy(), 'line': 16, 'meta': {'current_index': i, 'prev_values': [dp[i-1], dp[i-2]]}})
        dp[i] = dp[i-1] + dp[i-2]
        steps.append({'type': 'update', 'indices': [i], 'array': dp.copy(), 'line': 18, 'meta': {'result': dp[i], 'from_indices': [i-1, i-2]}})
    
    steps.append({'type': 'complete', 'indices': [], 'array': dp.copy(), 'line': 21, 'meta': {'final_result': dp[n] if n >= 0 else 0, 'dp_table': dp}})
    return steps

def knapsack_steps(weights, values, capacity):
    steps = []
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    steps.append({'type': 'init', 'indices': [], 'array': [row[:] for row in dp], 'line': 27, 'meta': {'n': n, 'capacity': capacity, 'dp_table': [row[:] for row in dp]}})
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            steps.append({'type': 'consider', 'indices': [i, w], 'array': [row[:] for row in dp], 'line': 32, 'meta': {'item': i-1, 'current_capacity': w, 'weight': weights[i-1], 'value': values[i-1]}})
            
            if weights[i-1] <= w:
                include = values[i-1] + dp[i-1][w - weights[i-1]]
                exclude = dp[i-1][w]
                steps.append({'type': 'compare', 'indices': [i, w], 'array': [row[:] for row in dp], 'line': 36, 'meta': {'include_value': include, 'exclude_value': exclude}})
                
                if include > exclude:
                    dp[i][w] = include
                    steps.append({'type': 'include', 'indices': [i, w], 'array': [row[:] for row in dp], 'line': 40, 'meta': {'decision': 'include', 'value': include}})
                else:
                    dp[i][w] = exclude
                    steps.append({'type': 'exclude', 'indices': [i, w], 'array': [row[:] for row in dp], 'line': 43, 'meta': {'decision': 'exclude', 'value': exclude}})
            else:
                dp[i][w] = dp[i-1][w]
                steps.append({'type': 'exclude', 'indices': [i, w], 'array': [row[:] for row in dp], 'line': 46, 'meta': {'decision': 'exclude', 'reason': 'overweight'}})
    
    # Backtrack to find selected items
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:
            selected.append(i-1)
            w -= weights[i-1]
    
    steps.append({'type': 'complete', 'indices': [], 'array': [row[:] for row in dp], 'line': 56, 'meta': {
        'max_value': dp[n][capacity],
        'selected_items': selected,
        'dp_table': [row[:] for row in dp]
    }})
    
    return steps

# Sample data for testing
def get_sample_fibonacci():
    return 6

def get_sample_knapsack():
    return {
        'weights': [2, 3, 4, 5],
        'values': [3, 4, 5, 6],
        'capacity': 5
    }