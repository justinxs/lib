// 冒泡排序
export function bubbleSort(arr) {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                arr[j] = arr[j] + arr[j + 1]
                arr[j + 1] = arr[j] - arr[j + 1]
                arr[j] = arr[j] - arr[j + 1]
            }
        }
    }
    return arr
}

// 选择排序
export function selectionSort(arr) {
    let len = arr.length, minIndex
    for (let i = 0; i < len - 1; i++) {
        minIndex = i
        for (let j = i + 1; j < len; j++) {
            if (arr[minIndex] > arr[j]) {
                minIndex = j
            }
        }

        if (minIndex === i) continue
        arr[i] = arr[minIndex] + arr[i]
        arr[minIndex] = arr[i] - arr[minIndex]
        arr[i] = arr[i] - arr[minIndex]
        
    }

    return arr
}

// 插入排序
export function insertionSort(arr) {
    let len = arr.length, preIndex, current
    for (var i = 1; i < len; i++) {
        preIndex = i - 1
        current = arr[i]
        while(preIndex >= 0 && arr[preIndex] > current) {
            arr[preIndex+1] = arr[preIndex];
            preIndex--
        }
        arr[preIndex+1] = current
    }

    return arr
}

// 希尔排序
export function shellSort() {
    let len = arr.length, temp, gap = 1
    while(gap < len / 3) {          //动态定义间隔序列
        gap = gap * 3 + 1
    }
    for (gap; gap > 0; gap = Math.floor(gap / 3)) {
        for (let i = gap; i < len; i++) {
            temp = arr[i]
            for (let j = i-gap; j >= 0 && arr[j] > temp; j -= gap) {
                arr[j + gap] = arr[j]
            }
            arr[j + gap] = temp
        }
    }

    return arr
}


// 归并排序
export function mergeSort(arr) {
    const merge = (left, right) => {
        let tmp = [];
        while (left.length && right.length) {
            if (left[0] < right[0]) {
                tmp.push(left.shift());
            } else {
                tmp.push(right.shift());
            }
        }

        return tmp.concat(left, right);
    }
    const sort = arr => {
        let len = arr.length
        if (len === 1) {
            return arr
        }
        let mid = Math.floor(len / 2), left = arr.slice(0, mid), right = arr.slice(mid);

        return merge(sort(left), sort(right));
    }

    return sort(arr)
}


// 快速排序
export function quickSort(arr) {
    // 交换
    const swap = (arr, a, b) => {
        [arr[a], arr[b]] = [arr[b], arr[a]]
    }
    // 分区
    const partition = (arr, left, right) => {
        /**
         * 开始时不知最终pivot的存放位置，可以先将pivot交换到后面去
         * 这里直接定义最右边的元素为基准
         */
        let pivot = arr[right];
        /**
         * 存放小于pivot的元素时，是紧挨着上一元素的，否则空隙里存放的可能是大于pivot的元素，
         * 故声明一个storeIndex变量，并初始化为left来依次紧挨着存放小于pivot的元素。
         */
        let storeIndex = left;
        for (let i = left; i < right; i++) {
            if (arr[i] < pivot) {
                /**
                 * 遍历数组，找到小于的pivot的元素，（大于pivot的元素会跳过）
                 * 将循环i次时得到的元素，通过swap交换放到storeIndex处，
                 * 并对storeIndex递增1，表示下一个可能要交换的位置
                 */
                swap(arr, storeIndex, i);
                storeIndex++;
            }
        }
        // 最后： 将pivot交换到storeIndex处，基准元素放置到最终正确位置上
        swap(arr, right, storeIndex);
        return storeIndex;
    }
    const sort = arr => {
        if (left > right) return;
        let storeIndex = partition(arr, left, right);
        sort(arr, left, storeIndex - 1);
        sort(arr, storeIndex + 1, right);
    }

    return sort(arr, 0, arr.length - 1)
}


// 堆排序
export function heapSort(arr) {
    let len = arr.length;
    // 交换
    const swap = (arr, a, b) => {
        [arr[a], arr[b]] = [arr[b], arr[a]]
    }
    // 堆调整
    const heapify = (arr, i) => {
        let left = 2 * i + 1, right = 2 * i + 2, largest = i;
        if (left < len && arr[left] > arr[largest]) {
            largest = left;
        }
        if (right < len && arr[right] > arr[largest]) {
            largest = right;
        }
    
        if (largest != i) {
            swap(arr, i, largest);
            heapify(arr, largest);
        }
    }
    //建立大顶堆
    const buildMaxHeap = arr => {
        for (let i = Math.floor(len / 2); i >= 0; i--) {
            heapify(arr, i)
        }
    }

    buildMaxHeap(arr);
    for (let i = arr.length - 1; i > 0; i--) {
        swap(arr, 0, i);
        len--;
        heapify(arr, 0);
    }

    return arr;
}

// 计数排序
export function countingSort(arr) {
    const sort = (arr, max) => {
        let bucket = new Array(max + 1), sortedIndex = 0, arrLen = arr.length, bucketLen = max + 1;

        for (let i = 0; i < arrLen; i++) {
            if (!bucket[arr[i]]) {
                bucket[arr[i]] = 0;
            }

            bucket[arr[i]]++;
        }
    
        for (let j = 0; j < bucketLen; j++) {
            while(bucket[j] > 0) {
                arr[sortedIndex++] = j;
                bucket[j]--;
            }
        }
    
        return arr;
    }
    let max = arr.reduce((res, num) => res > num ? res : num);
    
    return sort(arr, max)
}


// 桶排序
export function bucketSort(arr) {
    const minMax = (arr) => {
        let min = max = arr[0], len = arr.length, i
        for (i = 1; i < len; i++) {
            if (arr[i] < min) {
                min = arr[i];
            } else if (arr[i] > max) {
                max = arr[i];
            }
        }

        return [min, max]
    }

    const sort = (arr, min, max, bucketSize) => {
        //桶的初始化
        let bucketSize = bucketSize || 5; //设置桶的默认数量为5
        let bucketCount = Math.floor((max - min) / bucketSize) + 1;
        let buckets = new Array(bucketCount);
        for (i = 0; i < buckets.length; i++) {
            buckets[i] = [];
        }
        //利用映射函数将数据分配到各个桶中
        for (i = 0; i < arr.length; i++) {
            buckets[Math.floor((arr[i] - min) / bucketSize)].push(arr[i]);
        }
        arr.length = 0;
        for (i = 0; i < buckets.length; i++) {
            insertionSort(buckets[i]);                      //对每个桶进行排序，这里使用了插入排序
            for (var j = 0; j < buckets[i].length; j++) {
                arr.push(buckets[i][j]);
            }
        }
    
        return arr;
    }

    return arr.length === 0 ? arr : sort(arr, ...minMax(arr), 0)
}


// 基数排序
export function radixSort(arr) {
    let counter = [], maxDigit = 200, mod = 10, dev = 1, pos = 0;
    for (let i = 0; i < maxDigit; i++, dev *= 10, mod *= 10) {
        for(let j = 0; j < arr.length; j++) {
            let bucket = parseInt((arr[j] % mod) / dev);
            if(counter[bucket] == null) {
                counter[bucket] = [];
            }

            counter[bucket].push(arr[j]);
        }
        pos = 0;
        for(let j = 0; j < counter.length; j++) {
            let value = null;
            if(counter[j] != null) {
                while ((value = counter[j].shift()) != null) {
                    arr[pos++] = value;
                }
            }
        }
    }
    
    return arr
}