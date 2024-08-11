const express = require('express');
const app = express();
require('dotenv').config();
const path = require("path");
const Stripe = require("stripe");

app.set("views", path.join(__dirname, "views"));


function checkENV() {
    if (!process.env.SECRET_KEY) {
      throw new Error("Stripe Secret Key is not defined");
    }
}


checkENV();

const stripe = Stripe(process.env.SECRET_KEY);

app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.render('index.ejs');
})

app.post('/checkout',async(req,res)=>{
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Black T-Shirt",
            },
            unit_amount: 20 * 100,
          },
          quantity: 20,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "White T-Shirt",
            },
            unit_amount: 20 * 100,
          },
          quantity: 50,
        },
      ],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });
    res.redirect(session.url)
})

app.get('/complete',async(req,res)=>{
    const result = Promise.all([
        stripe.checkout.sessions.retrieve(req.query.session_id,{expand:['payment_intent.payment_method']}),
        stripe.checkout.sessions.listLineItems(req.query.session_id)
    ])
    console.log(JSON.stringify(await result));
    res.send('your payment was successful')
    
})

app.get('/cancel',(req,res)=>{
    res.redirect('.')
})


app.listen(3000, ()=>console.log('server is running'))
