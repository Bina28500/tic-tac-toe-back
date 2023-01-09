export interface Strategy {
    doAlgorithm(arr: number[], arr2: number[], size: number): boolean;
}

export class CrossReverseStrategy implements Strategy{
    //Универсальный(поле может быть больше, чем 3x3) алгоритм нахождения прогрессий с шагом 1 в ходах игры для побочной диагонали
    public doAlgorithm(arr: number[], arr2: number[], size: number): boolean{
        let result = false;
        let arr3 = [];
        for(let i = 0; i < arr.length; i++){
            let diff = arr2[i] - arr[i];
            console.log(diff)
            if((diff)%2 == 0){
                if ((diff == 0) && arr2[i] != ((size + 1)/2)) {
                    console.log(((size + 1) / 2))
                    continue;
                } else if(((arr[i] == (size + 1)/2 || arr2[i] == (size + 1)/2) && Math.abs(diff) != 0) || ((arr2[i] == size || arr[i] == size) && (Math.abs(diff) != (size - 1 )))){
                    console.log('!!')
                    continue;
                }else {
                    arr3.push(arr2[i] - arr[i]);
                }
            }
        } 
        arr3 = arr3.sort((a, b) => { return a - b });
        let mid = arr3.length/2;
        let left = arr3.slice(0, mid);
        let right = arr3.slice(mid+1, arr3.length).reverse();
        if (left.length == right.length){
            for(let j = 0; j < left.length; j++){
                if ((Math.abs(left[j])) == (Math.abs(right[j]))){
                    result = true;
                } else{
                    result = false;
                }
            }
        }
        return result;
    }
}

export class CrossClassicStrategy implements Strategy{
    //Универсальный(поле может быть больше, чем 3x3) алгоритм нахождения прогрессий с шагом 1 в ходах игры для основной диагонали
    public doAlgorithm(arr: number[], arr2: number[], size: number): boolean{
        let result = false;
        let count = 0;
        for(let i = 0; i < arr.length; i++){
            if(count == size){
                break;
            }
            if(arr[i] == arr2[i]){
                result = true;
                count++;
            } else{
                result = false;
            }
        } 
        if(count == size){
            return result;
        } else{
            return false;
        }
    }
}

export class SameStrategy implements Strategy{
    //Универсальный алогритм по нахождению прямой строки победы среди ходов
    doAlgorithm(arr: number[], arr2: number[], size: number): boolean{
        let result1 = this.cycle(arr);
        let result2 = this.cycle(arr2);
        if (result1 == size || result2 == size) {
            return true;
        } else{
            return false;
        }
    }
    private cycle(arr: number[]): number {
        let mf = 1;
        let m = 0;
        let item;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i; j < arr.length; j++) {
                if (arr[i] == arr[j])
                    m++;
                if (mf < m) {
                    mf = m;
                    item = arr[i];
                }
            }
            m = 0;
        }
        return mf;
    }
}