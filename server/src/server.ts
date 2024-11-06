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
XO?.connectSSynapse(0, image[0]);
XO?.connectSSynapse(1, image[1]);
XO?.connectSSynapse(2, image[2]);
XO?.connectSSynapse(3, image[3]);
XO?.connectSSynapse(4, image[4]);
XO?.connectSSynapse(5, image[5]);
XO?.connectSSynapse(6, image[6]);
XO?.connectSSynapse(7, image[7]);
XO?.connectSSynapse(8, image[8]);

XO?.getSynapse("X").on("change", (AName: string | number, value: number)=>{
    console.log(`MAIN: A element '${AName}' changed: ${value}`);
})

XO?.getSynapse("O").on("change", (AName: string | number, value: number)=>{
    console.log(`MAIN: A element '${AName}' changed: ${value}`);
})

image[0].emit('change', 1); image[1].emit('change', 0); image[2].emit('change', 1);
image[3].emit('change', 0); image[4].emit('change', 1); image[5].emit('change', 0);
image[6].emit('change', 1); image[7].emit('change', 0); image[8].emit('change', 1);

//XO?.learnSingle("X", 1);
//XO?.learnSingle("O", 0);

image[0].emit('change', 0); image[1].emit('change', 1); image[2].emit('change', 0);
image[3].emit('change', 1); image[4].emit('change', 0); image[5].emit('change', 1);
image[6].emit('change', 0); image[7].emit('change', 1); image[8].emit('change', 0);

//XO?.learnSingle("X", 0);
//XO?.learnSingle("O", 1);

image[0].emit('change', 0); image[1].emit('change', 0); image[2].emit('change', 0);
image[3].emit('change', 0); image[4].emit('change', 0); image[5].emit('change', 0);
image[6].emit('change', 0); image[7].emit('change', 0); image[8].emit('change', 0);

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