def quick_sort_steps(arr):
    steps = []
    a = arr.copy()

    def partition(l, r):
        pivot = a[r-1]
        i = l
        for j in range(l, r-1):
            steps.append({'type': 'compare', 'indices': [j, r-1], 'array': a.copy(), 'line': 6, 'meta': {'range': [l, r], 'pivot': r-1}})
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                steps.append({'type': 'swap', 'indices': [i, j], 'array': a.copy(), 'line': 9, 'meta': {'range': [l, r], 'pivot': r-1}})
                i += 1
        a[i], a[r-1] = a[r-1], a[i]
        steps.append({'type': 'swap', 'indices': [i, r-1], 'array': a.copy(), 'line': 12, 'meta': {'range': [l, r], 'pivot_index': i}})
        return i

    def quick(l, r):
        if l < r:
            p = partition(l, r)
            quick(l, p)
            quick(p+1, r)

    quick(0, len(a))
    steps.append({'type': 'done', 'array': a.copy(), 'indices': [], 'meta': {'range': [0, len(a)]}})
    return steps
