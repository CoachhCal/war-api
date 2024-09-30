import express from 'express';
import multer from 'multer';
import * as fs from 'node:fs';
import { PrismaClient } from '@prisma/client';


const router = express.Router();


//Prisma setup
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/'); // save uploaded files in `public/images` folder
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop(); // get file extension
        const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext; // generate unique filename - current timestamp + random number between 0 and 1000.
        cb(null, uniqueFilename);
    }
    });
    const upload = multer({ storage: storage });

    //Routes

//
//Read all
//

router.get('/all', async (req, res) => {
    const war = await prisma.war.findMany();
    if(war){
      res.status(200).json({Message: `${war.length} records retrieved successfully`, Records: war});
    }
  });
  
//
//Read by id
//

router.get('/read/:id', async (req, res) => {
  const id = req.params.id;

  //validate if not a number
  if(isNaN(id)){
    res.status(400).json({message: 'Invalid contact ID'});
    return;
  }

  const war = await prisma.war.findUnique({
    where: {
      id: parseInt(id)
    }
  })

  if(war){
    res.json(war); //display object
  } else{
    res.status(404).json({message: `Record ${id} not found`});
  }
});

//
//Create
//

router.post('/create', upload.single('image'), async (req, res) => {
  
  let fileName;
  const title = req.body.title;
  const startYear = req.body.startYear;
  const endYear = req.body.endYear;
  const description = req.body.description;
  
  if(!title){ //specific responses based on what key has not been added
    res.status(400).json({message: 'title must have value.'});
    return;
  }else if(!startYear){
    res.status(400).json({message: 'startYear must have value.'});
    return;
  }else if(!description){
    res.status(400).json({message: 'description must have a value.'});
    return;
  }else{
    fileName = req.file ? req.file.filename : null;
  }

  const war = await prisma.war.create({
    data: {
      title: title,
      startYear: startYear,
      endYear: endYear,
      description: description,
      fileName: fileName,
    },
  })

  res.status(200).json({message: `Record created successfully`, Record: war});
})

//
//Update
//

router.put('/update/:id', upload.single('image'), async (req, res) => {
  const id = req.params.id

  if(isNaN(id)){
    res.status(400).json({message: 'Invalid contact ID'});
    return;
  }

  const warUnique = await prisma.war.findUnique({
    where: {
      id: parseInt(id)
    }
  })

    let fileName = warUnique.fileName //file name of older file
    
    if(req.file && warUnique.fileName!=null){ //if file is being uploaded and the previous file is not null
      fs.unlink(`./public/images/${warUnique.fileName}`, (err) => {});
      fileName = req.file.filename;
    }else if(req.file){ //if file is being uploaded and the previous one is null (no need to delete older file in this case)
      fileName = req.file.filename;
    }
  
  const startYear = req.body.startYear;
  const title = req.body.title;
  const endYear = req.body.endYear;
  const description = req.body.description;

  const war = await prisma.war.updateMany({
    where: { //get id of record being updated
      id: parseInt(id)
    },
    data: { //update record
      title: title,
      startYear: startYear,
      endYear: endYear,
      description: description,
      fileName: fileName,
    },
  })
  if(!title && !startYear && !description && !endYear){ //if none of these key values are selected
    res.status(400).json({message: `No values selected to update`})
  }else if(war){
    res.status(200).json({message: `Record ${id} updated successfully`});
  }else{
    res.status(404).json({message: 'Record not found.'});
  }
})

//
//Delete
//

router.delete('/delete/:id', async (req, res) => {
  const id = req.params.id

  if(isNaN(id)){
    res.status(400).json({message: 'Invalid contact ID'});
    return;
  }

  const war = await prisma.war.findUnique({
    where: {
      id: parseInt(id)
    }
  })
  await prisma.war.deleteMany({
    where: {
      id: parseInt(id)

    }
  })

  try{
    fs.unlink(`./public/images/${war.fileName}`, (err) => { //delete file. If there is no file (null), will still run due to being in try/catch
      }
  )}
  catch{}

  if(war){
    res.status(200).json({message: `Record ${id} successfully deleted`});
  } else{
    res.status(404).json({message: 'contact not found.'});
  }
})

export default router;
  