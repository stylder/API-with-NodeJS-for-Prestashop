/* Home page */
module.exports = function(app) {
    app.get('/', function(req, res){
        res.render('index', { title: 'API REST for Prestashop' });
    });
}