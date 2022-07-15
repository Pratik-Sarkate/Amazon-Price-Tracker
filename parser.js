require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const nightmare = require('nightmare')()



const args = process.argv.slice(2)
const url = args[0]
const minPrice = args[1]

/*
// "https://www.amazon.in/American-Tourister-Polypropylene-Skytracer-Trolley/dp/B07HVQ58RP"

Input format: node parser.js 'url' 'price'    (without '')
*/

checkPrice()

async function checkPrice(){
    try{
        const priceString = await nightmare.goto(url)
        .wait(".a-price .a-offscreen")
        .evaluate(() => document.querySelector(".a-price .a-offscreen").innerText)
        .end()

        let newString = priceString.replace('₹', '')
        newString = newString.replace(',', '')
        // console.log(newString);
        const priceNumber = parseFloat(newString)
        // console.log(priceNumber);

        if(priceNumber < minPrice){
            await sendEmail(
                'Price Is Low',
                `The price on ${url} has dropped below ${minPrice}`
            )
        }
        // if(priceNumber < minPrice){
        //     console.log("It is cheap => ₹",priceNumber);
        // }else{
        //     console.log("It is expensive => ₹",priceNumber);
        // }
    } catch (e){
        await sendEmail('Amazon Price Checker Error', e.message)
        throw e
    } 
}

function sendEmail(subject, body) {
    const email = {
        to: 'vaxija5379@opude.com',    // any email id
        from: 'vaxija5379@opude.com',  // verified sender email of sendgrid
        subject: subject,
        text: body,
        html: body
    }

    return sgMail.send(email)
}