const express=require('express');
const app=express();
const mongoose=require('mongoose');
const bodyParser=require('body-parser')
const authRouter=require('./routes/authRouter')

const PORT=process.env.PORT || 5000;
mongoose.connect("mongodb+srv://eGram:@TeamIAF@cluster0.jtyap.mongodb.net/Authentication?retryWrites=true&w=majority",
{ useNewUrlParser: true,
    useUnifiedTopology: true,
     useFindAndModify: true },()=>{
    console.log("Connected to DB");
});

// const parseUrl = express.urlencoded({ extended: false });
// const parseJson = express.json({ extended: false });
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/profile', express.static('images'));
// parse application/json
app.use(bodyParser.json())

app.use('/user',authRouter);

app.listen(PORT,()=>{
    console.log("Server connected successfully on "+PORT);
});