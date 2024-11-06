import { randomUUID, UUID } from "crypto";
import path from "path";
import fs from 'fs';
import { EventEmitter } from "stream";

interface IPerceptron {
    id: UUID;
    name: string;
    SCount: number;
    ANames: Array<string>;
    W: Array<Array<number>>;
    RBounds: Array<number>;
    learnCount: Array<number>;
}

export class Synapse extends EventEmitter {

}

export class Perceptron {
    private id: UUID;
    private data: IPerceptron;
    private RSynapses: Array<Synapse>;
    private SValuesCache: Array<number>;
    private AValuesCache: Array<number>;
    constructor(_id?: UUID, data?: IPerceptron) {
        if (_id === undefined) {
            this.id = randomUUID();
            if (data === undefined) throw new Error(`Can't create new perceptron without data`);
            this.data = data;
            this.repairW();
            this.savePerceptronData();
        } else {
            this.id = _id;
            const data = this.loadPerceptronData();
            if (data === undefined) throw Error(`Unable load Perceptron '${_id}'`);
            this.data = data;
            if (this.repairW()) this.savePerceptronData();
        }
        this.AValuesCache = new Array(this.data.ANames.length).fill(0);
        this.RSynapses = new Array();
        for (const AEl in this.data.ANames) this.RSynapses.push(new Synapse());
        this.SValuesCache = new Array(this.data.SCount).fill(0);
    }

    protected savePerceptronData() {
        if (process.env.data === undefined) throw Error(`Env variable data is undefined`);
        fs.writeFileSync(path.join(process.env.data, `${this.id}.json`), JSON.stringify(this.data, null, 4));
    }
    protected loadPerceptronData(): IPerceptron | undefined {
        const removeJSONComments = (json: string) => {
            return json.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
        }

        try {
            if (process.env.data === undefined) throw Error(`Env variable data is undefined`);
            let data = fs.readFileSync(path.join(process.env.data, `${this.id}.json`), "utf-8");
            console.log(`Perceptron '${this.id}' loaded`);
            return JSON.parse(removeJSONComments(data.toString()));
        } catch (err: any) {
            console.error(`Controller not started - ${err.message}`);
        }
    }
    onSChanged(SNumber: number, value: number) {
        this.SValuesCache[SNumber] = value;
        console.log(`S element # ${SNumber} of perceptron '${this.data.name}' changed. New value is: ${value}`);
        this.data.ANames.forEach(aname=> this.calcA(aname));
    }
    connectMultiSSynapse(ev: Synapse[]) {
        ev.forEach((syn, idx)=>syn.on('change', this.onSChanged.bind(this, idx)));        
    }
    connectSSynapse(SNumber: number, ev: Synapse) {
        ev.on('change', this.onSChanged.bind(this, SNumber));
    }

    static pushMultiSValue(synapses: Synapse[], bits: number) {
        let mod = bits;
        synapses.forEach(syn=> {
            syn.emit('change', mod % 2);
            mod = mod >> 1;
        });
    }

    get json(): IPerceptron {
        return this.data;
    }

    private getAIndex(AName: string | number): number {
        if (typeof AName === "string") {
            const idx = this.data.ANames.findIndex(v=>v === AName);
            if (idx === -1) throw Error(`A element named '${AName}' not found`);
            return idx;
        } else {
            return AName;
        }
    }

    getSynapse(AName: string | number): Synapse {
        return this.RSynapses[this.getAIndex(AName)];
    }
    
    private learnAtom(AName: string | number, rightValue: number): number { // return percent of goal achive
        const Aindex = this.getAIndex(AName);
        this.data.learnCount[Aindex]++;
        const curRes = this.calcA(AName);
        const v = [1, ...this.SValuesCache];
        const diff = rightValue - curRes;
        for (let i = 0; i < this.data.SCount + 1; i++){
            this.data.W[Aindex][i] = (this.data.W[Aindex][i] * this.data.learnCount[Aindex] + v[i] * diff/(this.data.SCount + 1))/this.data.learnCount[Aindex];
        }
        return diff;
    }
    
    learnSingle(AName: string | number, rightValue: number, uptoPercent: number = 0.1, learnCount?: number): number {
        const Aindex = this.getAIndex(AName);
        // doing until percent goal achieved
        const maxM = learnCount === undefined?10000:learnCount;
        let m = 0; // counter is a fuse to infinite cycle
        while (m++ < maxM) {
            if (Math.abs(this.learnAtom(AName, rightValue)) < uptoPercent) break;
        } 
        console.log(`A element '${AName}' of perceptron '${this.json.name}' learned: W = '${this.data.W[Aindex]}'; count = ${this.data.learnCount[Aindex]}`);
        this.savePerceptronData();
        return this.data.learnCount[Aindex];
    }

    private calcA(AName: string | number): number {
        const x = this.getAIndex(AName);
        const v = [1, ...this.SValuesCache];
        const w = this.data.W[x];
        const ret = v.reduce((part, v, i)=> part + v * w[i], 0.0);
        const needNotify = ret !== this.AValuesCache[x];
        this.AValuesCache[x] = ret;
        //console.log(`A element '${AName}' of perceptron '${this.json.name}' recalculated: ${ret}`);
        if (needNotify) this.getSynapse(x).emit('change', AName, ret);
        return ret;
    }
    private repairW(): boolean {
        let ret = false;
        if (this.data.W.length !== this.data.ANames.length) {
            ret = true;
            this.data.W = [];
            this.data.learnCount = [];
            for (let i = 0; i < this.data.ANames.length; i++) {
                this.data.W.push([]);
                this.data.learnCount.push(0);
            };
        }
        for (const elA of this.data.W) {
            if (elA.length !== this.data.SCount + 1) {
                elA.splice(0, elA.length);
                for (let i = 0; i < this.data.SCount + 1; i++) elA.push(Math.random());
                ret = true;
            }
        }
        if (ret) console.log(`W repaired: ${this.data.W}`);
        return ret;
    }
}