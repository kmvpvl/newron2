import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Perceptron, Synapse } from "./perceptron";
import { Brain } from "./brain";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 8000;

const application = express();
application.use(express.json());
application.use(morgan('tiny'));
application.use(cors());

const brain = new Brain();
const XO = brain.getNeuronByName("XO");
const image: Array<Synapse> = [];
image.push(
    new Synapse(), new Synapse(), new Synapse(),
    new Synapse(), new Synapse(), new Synapse(),
    new Synapse(), new Synapse(), new Synapse()
);
XO?.connectMultiSSynapse(image);

XO?.getSynapse("X").on("change", (AName: string | number, value: number)=>{
    console.log(`MAIN: A element '${AName}' changed: ${value}`);
})

XO?.getSynapse("O").on("change", (AName: string | number, value: number)=>{
    console.log(`MAIN: A element '${AName}' changed: ${value}`);
})

// X X
//  X
// X X
Perceptron.pushMultiSValue(image, 0b101010101)

//XO?.learnSingle("X", 1);
//XO?.learnSingle("O", 0);

//  X
// X X
//  X
Perceptron.pushMultiSValue(image, 0b010101010)

//XO?.learnSingle("X", 0);
//XO?.learnSingle("O", 1);

//  
// 
//  
Perceptron.pushMultiSValue(image, 0b000000000)

//XO?.learnSingle("X", 0);
//XO?.learnSingle("O", 0);



application.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
});
  
process.on('SIGINT', () => {
    console.log('SIGINT signal received.');
});