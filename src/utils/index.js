export const toRegex = (key, caseSensitive) => {
    if(caseSensitive) {
        return new RegExp(`${key}`,"g");
    }else {
        return new RegExp(`${key}`,"gi");
    }
}

export const search = (lines, key, caseSensitive) => {
    key = key.trim();
    let indices = [];
    if(key) {
        lines.forEach((line, idx) => {
            if(line.match(toRegex(key, caseSensitive)))
                indices.push(idx);
        });
    }
    return {key, indices};
}

export const findNext = (pointer, n) => {
    pointer++;
    if(pointer > n)
        pointer = 0;

    return pointer;
}

export const findPrev = (pointer, n) => {
    pointer--;
    if(pointer < 0)
        pointer = n-1;

    return pointer;
}

export const  sortObject = (data) => {
    // Convert to array
    let sortable = Object.values(data).map((container) => {
        return container;
    });
    // Sort
    sortable.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase())
            return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase())
            return 1;
        return 0;
    });
    // Convert back to object
    let sortedData = sortable.reduce((container, currentValue) => ({...container, [currentValue.id]: currentValue}), {});
    return sortedData;
}