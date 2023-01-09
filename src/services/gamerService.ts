interface IGamer {
    id: string
    name: string
    room: string
    forWhat: string
}

export default class Gamer implements IGamer {
    private _id: string
    private _name: string
    private _room: string
    private _forWhat: string

    constructor(id: string, name: string, room: string, forWhat: string) {
        this._id = id;
        this._name = name
        this._forWhat = forWhat
        this._room = room
    }
    public get id(): string {
        return this._id
    }

    public get room(): string {
        return this._room
    }

    public get name(): string {
        return this._name
    }
    public get forWhat(): string {
        return this._forWhat
    }

}