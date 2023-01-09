import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import {GameService} from './services/gameService'
import Gamer from './services/gamerService'
import { v4 as uuidv4 } from 'uuid'
import * as dotenv from 'dotenv'
import { CrossClassicStrategy, CrossReverseStrategy, SameStrategy } from './services/strategies/strategies'

dotenv.config();
const port: number = process.env.PORT || 8000

class App {
    private server: http.Server
    private port: number

    private io: socketIO.Server
    private gamers: { [id: string]: Gamer} = {}
    private games: {[room: string]: GameService} = {};

    constructor(port: number) {
        this.port = port

        const app = express()

        this.server = new http.Server(app)
        this.io = new socketIO.Server(this.server, {
            cors: {
                origin: "*",
                credentials: true
            }
        })

        this.io.on('connection', (socket: socketIO.Socket) => {
            console.log('a user connected : ' + socket.id);

            socket.on('start', () => {
                socket.emit('roomName' , uuidv4());
            })

            socket.on('join', room => {
                socket.join(room);
                console.log(`Подключился к комнате ${room}`);
            });
        
            socket.on('name', (gamerName: string) => {
                console.log(`Отправлено имя 1 игрока ${gamerName}`);
                let arr;
                let first;
                for (let key in this.gamers) {
                    if (this.gamers[key].room == Array.from(socket.rooms)[1]) {
                        first = this.gamers[key];
                    } else {
                        break;
                    }
                }
                if (first != undefined) {
                    let secondGamer = new Gamer(socket.id, gamerName, Array.from(socket.rooms)[1], 'o');
                    this.gamers[socket.id] = secondGamer;
                    arr = [{ 'name': first.name, 'forWhat': first.forWhat }, { 'name': secondGamer.name, 'forWhat': secondGamer.forWhat }];
                    socket.emit('forWhat', 'o');
                    this.games[Array.from(socket.rooms)[1]] = new GameService(first, secondGamer, new SameStrategy);
                } else {
                    let firstGamer = new Gamer(socket.id, gamerName, Array.from(socket.rooms)[1], 'x');
                    this.gamers[socket.id] = firstGamer;
                    arr = [{'name': firstGamer.name, 'forWhat': firstGamer.forWhat}, ''];
                    socket.emit('forWhat', 'x');
                }
                console.log(arr);
                console.log(Array.from(socket.rooms)[1])
                this.io.to(Array.from(socket.rooms)[1]).emit('gamerDetails', arr);
            });

            socket.on('step', message => {
                let gamer = this.gamers[socket.id];
                let game = this.games[gamer.room];
                message = JSON.parse(message);
                game.addStep(message);
                if (Number(message.step) >= process.env.SIZE) {
                    let resultOfGame;
                    if(game.checkWin(gamer.forWhat)){
                        resultOfGame = true
                    } else {
                        game.setStrategy(new CrossClassicStrategy);
                        if(game.checkWin(gamer.forWhat)){
                            resultOfGame = true
                            game.setStrategy(new SameStrategy);
                        } else{
                            game.setStrategy(new CrossReverseStrategy);
                            if(game.checkWin(gamer.forWhat)){
                                resultOfGame = true;
                                game.setStrategy(new SameStrategy);
                            } else{
                                resultOfGame = false;
                                game.setStrategy(new SameStrategy);
                            }
                        }
                    }
                    console.log(resultOfGame);
                    if (resultOfGame === true) {
                        socket.broadcast.to(gamer.room).emit('stepback', JSON.stringify(message));
                        game.addGameResultToHistory(gamer.forWhat, resultOfGame);
                        let final = game.checkFinalWin(gamer.forWhat);
                        if (final === true) {
                            this.io.to(gamer.room).emit('finalWinMessage', `${gamer.name} выиграл окончательно!`);
                            console.log('Сообщение о финальной победе!')
                        } else {
                            this.io.to(gamer.room).emit('winMessage', [`${gamer.name} выиграл!`, gamer.forWhat]);
                            console.log('Сообщение о победе!')
                        }
                        let score = game.returnScore();
                        this.io.to(gamer.room).emit('newScore', score);
                        game.cleanLocalHistory();
                        } else {
                        if (Number(message.step) == 5) {
                                socket.broadcast.to(gamer.room).emit('stepback', JSON.stringify(message));
                                this.io.to(gamer.room).emit('noWin', ['Ничья', gamer.forWhat]);
                            } else {
                                socket.broadcast.to(gamer.room).emit('stepback', JSON.stringify(message));
                         }
                    }
                } else {
                    socket.broadcast.to(gamer.room).emit('stepback', JSON.stringify(message));
                }
            })
            socket.on('timeOut', () => {
                let gamer = this.gamers[socket.id];
                let game = this.games[gamer.room];
                let gamerVS: Gamer;
                if (socket.id == game.firstGamer.id) {
                    gamerVS = game.secondGamer;
                } else {
                    gamerVS = game.firstGamer;
                }
                console.log(gamerVS);
                game.addGameResultToHistory(gamerVS.forWhat, true);
                let final = game.checkFinalWin(gamerVS.forWhat);
                if (final === true) {
                    this.io.to(gamer.room).emit('finalWinMessage', `${gamerVS.name} выиграл окончательно!`);
                    console.log('Сообщение о финальной победе!')
                } else {
                    this.io.to(gamer.room).emit('winMessage', [`${gamerVS.name} выиграл!`, gamerVS.forWhat]);
                    console.log('Сообщение о победе!')
                }
                let score = game.returnScore();
                this.io.to(gamer.room).emit('newScore', score);
                game.cleanLocalHistory();
            })

            socket.on('reset', () => {
                let gamer = this.gamers[socket.id];
                let game = this.games[gamer.room];
                game.cleanLocalHistory();
                game.cleanScore();
                this.io.to(gamer.room).emit('resetBack');
            })

            socket.on('exit', () => {
                let gamer = this.gamers[socket.id];
                let game = this.games[gamer.room];
                let gamerVS: Gamer;
                if (game) {
                    if (socket.id == game.firstGamer.id) {
                        gamerVS = game.secondGamer;
                    } else {
                        gamerVS = game.firstGamer;
                    }
                    this.io.to(gamerVS.room).emit('exitBack', [`${gamer.name} покинул игру`, gamer.forWhat]);
                }
                socket.leave(gamer.room);
            })
            });
        }

    public Start() {
        this.server.listen(this.port)
        console.log(`Server listening on port ${this.port}.`)
    }
}

new App(port).Start()