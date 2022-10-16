import { Server } from 'http';
import express, { Application } from 'express';
import assert from 'assert';
import fetch from 'node-fetch';
import { Parser } from './parser';
import { Tutor } from './Tutor';
import {Tutee} from './Tutee';


export class Client {

    public database:Array<Array<string>> = [];//Database = new Database();

    private async fetchFromServer():Promise<Array<Array<string>>>{
        const response = await fetch('http://localhost:8790/getData');
        const data = await response.text();
        return Parser(data);
    }
 
    public async start():Promise<void>{
        this.database = await this.fetchFromServer();
        console.log(this.database);
    }

    public constructor() {
 
    }
    private htmlFromList(data:Array<Array<string>>):string{
        var result = '';
        for (let entry of data){
            result = result + `<span id=${entry[1]}>Name: ${entry[1]} Subjects: ${entry[3]} </span>`;
        }
        return result;
    }
    public fetchMatchedTutee(sliderVal:string, tutor:Tutor):string{
        let result =[]
        for (let entry of this.database){
            if (entry[0] == 'tutee'){
                if (parseInt(entry[6]??'')>parseInt(sliderVal)){
                    const tuteeAvail:Array<string> = entry[4]?.split(',')??[];
                    var match:boolean = false;
                    for (let tm of tuteeAvail){
                        if (tm in tutor.availabilty){
                            match = true;
                        }
                    }
                    if (match){
                        const tuteeSubs:Array<string> = entry[3]?.split(',')??[];
                        match =false;
                        for (let tm of tuteeSubs){
                            if (tm in tutor.subjects){
                                match = true;
                            }
                        }
                        if (match){
                            result.push(entry);
                        }
                    }
                    
                }
            }
        }

        return this.htmlFromList(result);

    }
    public checkID(name:string, password:string):number{
        for (let entry of this.database){
            console.log(entry);
            console.log(entry[0]);
            if (entry[1] == name && entry[2]==password){
                if (entry[0]=='tutor'){
                    return 3;
                }else{
                    return 4;
                }
            }
        }
        return 1;
    }
    public getHTMLbyName(name:string):string{
        for (let entry of this.database){
            if (entry[1] == name){
                if (entry[0]=='tutor'){
                    const subjects:Array<string> =entry[3]?.split(',')??[];
                    return new Tutor(entry[1],subjects,entry[4]?.split(',')??[]).generateHTML();
                }else{
                    const subjects:Array<string> =entry[3]?.split(',')??[];
                    return new Tutee(entry[1],subjects, entry[4]?.split(',')??[]).generateHTML();
                }
            }
        }
        return '';
    }


}

