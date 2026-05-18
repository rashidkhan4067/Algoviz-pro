def merge_sort_steps(arr):
    steps = []
    a = arr.copy()

    def merge_sort(l, r):
        if r - l <= 1:
            return a[l:r]
        m = (l + r) // 2
        left = merge_sort(l, m)
        right = merge_sort(m, r)
        i = j = 0
        merged = []
        while i < len(left) and j < len(right):
            # comparison
            steps.append({'type': 'compare', 'indices': [l + i, m + j], 'array': a.copy(), 'line': 11, 'meta': {'range': [l, r], 'mid': m}})
            if left[i] <= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        # write back
        for k, val in enumerate(merged):
            a[l + k] = val
            steps.append({'type': 'overwrite', 'indices': [l + k], 'array': a.copy(), 'line': 20, 'meta': {'range': [l, r], 'mid': m}})
        return merged

    merge_sort(0, len(a))
    steps.append({'type': 'done', 'array': a.copy(), 'indices': [], 'meta': {'range': [0, len(a)]}})
    return steps
