// Functions to get facebook and twitter share counts.

(function() {
    function getfbcount(url){
        var fblikes;
        $.getJSON('http://graph.facebook.com/?ids=' + url, function(data){;
            fblikes = data[url].shares;
            $('.fbCount').append(fblikes + " likes");
        });
    }
    function gettwcount(url){
        var tweets;
        $.getJSON('http://urls.api.twitter.com/1/urls/count.json?url=' + url + '&callback=?', function(data){
            tweets = data.count;
            $('.twCount').append(tweets + " tweets");
        });
    }
    var url = "http://www.femurdesign.com/theremin/";
    getfbcount(url);
    gettwcount(url);
}());