const mongoose=require('mongoose')
const validator=require("validator")
const bcryptjs=require("bcryptjs")
const jwt=require('jsonwebtoken')
const reporterSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        lowerCase:true,
        trim:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value))

            throw new Error("email is not valid");
        }  //value is the email value
    },
    age:{
        type:Number,
        default:20,
        validate(value){
            if(value<0)
            throw new Error("please enter a valid age");
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:6,
       validate(value){
        var strongExp = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))")
        if(!strongExp.test(value))
        throw new Error("the password must contain uppercase,lowercase,digits")
       },
    },
    phone:{
        type:String,
        required:true,
       // maxLength:12,
        //minLength:11,
        validate(value){
            if(!validator.isMobilePhone(value,"ar-EG"))
            {throw new Error("phone is not valid")
        }
        }
    },
       tokens:[{
         type:String,
           required:true
       }],
       image:{
        type:Buffer
       }
})
reporterSchema.virtual('articles',{
    ref:'Article',
    localField:'_id',
    foreignField:'reporter'
})
reporterSchema.methods.generateToken=async function()
{
    const reporter=this
    console.log(reporter)
    const token=jwt.sign({_id:reporter._id.toString()},process.env.JWT_SECRET)
    reporter.tokens=reporter.tokens.concat(token)

    await reporter.save()
    return token
}
reporterSchema.pre('save',async function(){
    const reporter=this
    if(reporter.isModified('password'))
    reporter.password=await bcryptjs.hash(reporter.password,8)
})
reporterSchema.statics.findByCredentials=async(email,password)=>{
    const reporter=await Reporter.findOne({email})
    if(!reporter)
    {throw new error("please check email and password")}

    const isMatched= await bcryptjs.compare(password,reporter.password)
    if(!isMatched)
    {throw new error("please check email and password")}
    return reporter
}
reporterSchema.statics.findByCredentials=async(email,password)=>{
    const reporter=await Reporter.findOne({email})
    if(!reporter)
    {throw new error("please check email and password")}

    const isMatched= await bcryptjs.compare(password,reporter.password)
    if(!isMatched)
    {throw new error("please check email and password")}
    return reporter
}
reporterSchema.methods.toJSON=function(){
    const reporter=this
    const reporterObject=reporter.toObject()
    delete reporterObject.password
    delete reporterObject.tokens
    return reporterObject
}
const Reporter=mongoose.model('Reporter',reporterSchema)
module.exports=Reporter

