def bubble_sort(arr):
    steps = []
    a = arr.copy()
    n = len(a)
    # simple bubble sort that records steps
    for i in range(n):
        for j in range(0, n - i - 1):
            steps.append({'type': 'compare', 'indices': [j, j+1], 'array': a.copy(), 'line': 3, 'meta': {'sorted_tail': n - i - 1}})
            if a[j] > a[j+1]:
                a[j], a[j+1] = a[j+1], a[j]
                steps.append({'type': 'swap', 'indices': [j, j+1], 'array': a.copy(), 'line': 5, 'meta': {'sorted_tail': n - i - 1}})
    steps.append({'type': 'done', 'array': a.copy(), 'indices': [], 'meta': {'sorted_tail': 0}})
    return steps
