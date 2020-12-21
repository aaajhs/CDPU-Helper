const { db } = require("../app");
const time_service = require("../services/time_service");
const { WebClient } = require('@slack/web-api'); // official slack web api
const web = new WebClient(process.env.token);
const roulette_doc = db.collection('config').doc('roulette');

module.exports = {
    get_from_db,
    post_to_channel
}

function get_from_db(){
    roulette_doc.get()
        .then(doc => {
            if(!doc.exists){
                console.log("[App] Cannot find roulette config!");
            }
            else {
                return doc.data();
            }
        })
        .catch(err => console.log(err));

    return;
}

function post_to_channel(req, config){
    console.log(config);
    const emoji_pool = config.emoji;
    var last_called = config.last_called;
    var order = config.order;
    var today = new Date();

    time_service.get_week_number
    if(time_service.get_week_number(last_called) != time_service.get_week_number(today)){
        order = (order + 1) % 4;
    }
    
    update_db(order);

    web.chat.postMessage({
        token: process.env.token,
        channel: req.body.channel_id,
        text: (emoji_pool[order]),
        link_names: 1
      }).catch(err => console.log(err));

    return;
}

function update_db(order){
    var today = new Date();

    roulette_doc.set({
        'last_called': today,
        'order': order
    })
    .catch(err => {
        console.log("[App] Error saving roulette config: " + err);
    });

    return;
}