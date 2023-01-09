import Gamer from './gamerService';
import { Strategy } from './strategies/strategies';

type strType = {[key: string]: string | string[]};
type boolArrType = {[key: string]: boolean[]};

const size = 3;

interface IGame{
    firstGamer: Gamer
    secondGamer: Gamer
    firstGamerHistory: strType
    secondGamerHistory: strType
    commonScoreHistory: boolArrType
}

export class GameService implements IGame{

    public firstGamer: Gamer;
    public secondGamer: Gamer;
    private _firstGamerHistory: strType = {};
    private _secondGamerHistory: strType = {};
    private _commonScoreHistory: boolArrType = {'x': [], 'o': []};
    private _strategy: Strategy;

    constructor(first: Gamer, second: Gamer, strategy: Strategy) {
        this.firstGamer = first;
        this.secondGamer = second;
        this._strategy = strategy;
    }
    public get firstGamerHistory(): strType {
        return this._firstGamerHistory;
    }

    public get secondGamerHistory(): strType {
        return this._secondGamerHistory;
    }

    public get commonScoreHistory(): boolArrType {
        return this._commonScoreHistory;
    }
    public setStrategy(strategy: Strategy){
        this._strategy = strategy;
    }

    public addGameResultToHistory(gamer: string, result: boolean){
        this._commonScoreHistory[gamer].push(result);
        if (gamer == 'x') {
            this._commonScoreHistory.o.push(!result);
        } else {
            this._commonScoreHistory.x.push(!result);
        }
    }

    public cleanLocalHistory(){
        this._firstGamerHistory = {};
        this._secondGamerHistory = {};
    }
    public cleanScore() {
        this._commonScoreHistory = { 'x': [], 'o': [] };
    }

    public returnScore(): number[]{
        let first = this._commonScoreHistory.x.filter(item => item == true );
        let second = this._commonScoreHistory.o.filter(item => item == true );
        console.log(this.commonScoreHistory);
        return [first.length, second.length];
    }

    public addStep(step: {[key: string]: string}){
        let arr = Object.keys(step)[0].split(',');
        if(Object.values(step)[0] === 'x'){
            this._firstGamerHistory[step.step] = arr;
        } else {
            this._secondGamerHistory[step.step] = arr;
        }
    }
    
    public checkFinalWin(gamer: string): boolean{
        let result = 0;
        let wasStoped = 0
        let array = this._commonScoreHistory[gamer]
        for(let i = 0; i< array.length; i++){
            if(array[i] === true){
                result++;
                wasStoped++
            } else{
                wasStoped = 0
            }
        }
        if(result == 10){
            return true;
        } else if(wasStoped == 3){
            return true;
        } else{
            return false;
        }
    }

    public checkWin(gamer: string): boolean {
        let result;
        if(gamer === 'x'){
            let keys = Object.values(this._firstGamerHistory).map(item => {return Number(item[0])});
            let values = Object.values(this._firstGamerHistory).map(item => { return Number(item[1]) });;
            result = this._strategy.doAlgorithm(keys, values, size);
        } else {
            let keys = Object.values(this._secondGamerHistory).map(item => {return Number(item[0])});;
            let values = Object.values(this._secondGamerHistory).map(item => {return Number(item[1])});;
            result = this._strategy.doAlgorithm(keys, values, size);
        }
        return result;
    }
}