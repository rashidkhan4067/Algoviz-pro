def linear_search_steps(arr, target):
    steps = []
    a = arr.copy()
    
    for i in range(len(a)):
        steps.append({'type': 'compare', 'indices': [i], 'array': a.copy(), 'line': 3, 'meta': {'target': target, 'current_value': a[i]}})
        if a[i] == target:
            steps.append({'type': 'found', 'indices': [i], 'array': a.copy(), 'line': 5, 'meta': {'target': target, 'found_at': i}})
            return steps
    
    steps.append({'type': 'not_found', 'indices': [], 'array': a.copy(), 'line': 8, 'meta': {'target': target}})
    return steps

def binary_search_steps(arr, target):
    steps = []
    a = sorted(arr.copy())  # Binary search requires sorted array
    
    low = 0
    high = len(a) - 1
    
    steps.append({'type': 'init', 'indices': [low, high], 'array': a.copy(), 'line': 15, 'meta': {'target': target, 'sorted_array': True}})
    
    while low <= high:
        mid = (low + high) // 2
        steps.append({'type': 'mid_calc', 'indices': [mid], 'array': a.copy(), 'line': 19, 'meta': {'low': low, 'high': high, 'mid_value': a[mid]}})
        
        steps.append({'type': 'compare', 'indices': [mid], 'array': a.copy(), 'line': 21, 'meta': {'target': target, 'current_value': a[mid]}})
        
        if a[mid] == target:
            steps.append({'type': 'found', 'indices': [mid], 'array': a.copy(), 'line': 24, 'meta': {'target': target, 'found_at': mid}})
            return steps
        elif a[mid] < target:
            steps.append({'type': 'move_right', 'indices': [mid], 'array': a.copy(), 'line': 27, 'meta': {'low': mid + 1, 'high': high}})
            low = mid + 1
        else:
            steps.append({'type': 'move_left', 'indices': [mid], 'array': a.copy(), 'line': 30, 'meta': {'low': low, 'high': mid - 1}})
            high = mid - 1
    
    steps.append({'type': 'not_found', 'indices': [], 'array': a.copy(), 'line': 33, 'meta': {'target': target}})
    return steps