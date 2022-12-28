var current_pin = '';
var the_pin = '';

var reset_pin = function() {
    current_pin = '';
    update_pin_display();
};

var append_to_pin = function(input) {
    current_pin += input;
    update_pin_display();
    attempt_auth();
};

var update_pin_display = function() {
    the_pin = current_pin || '<i>none</i>';
    if (the_pin == '<i>none</i>') {
        $('#current_pin').html("ENTER PIN");
    }else{
        $('#current_pin').html("* ".repeat(the_pin.length));
    }
};

function start_website() {
// your code to run after the timeout
    var params = getQueryParams(location.search);
    var url = location.origin;

    if(params["next"]) {
        url += params["next"];
    }

    $('#current_pin').html("Pin: " + "#".repeat(the_pin.length));
    window.location = url;
}

var isNumeric = function(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


var attempt_auth = function() {
    $.post("/login/pin/auth", {"pin": current_pin})
        .success(function() {
            $('.welcome-image').css('visibility', 'visible')
            setTimeout(start_website, 1000);
            
        })
};

var flashkey = function(id) {
    $('#'+id).css('background-color', '#092309')
    $('#'+id).css('color', '#3ae23a')
    $('#'+id).css('transform', 'scale(1.2)')
    $('#'+id).css('border', '3px solid #8ca78c')
    setTimeout(function(){
        $('#'+id).css('background-color', '#141414')
        $('#'+id).css('color', '#f8f9fa')
        $('#'+id).css('transform', 'scale(1)')
        $('#'+id).css('border', '2px solid #3ae23a')
    }, 200)
  }


$(document).ready(function() {
    $(document).keypress(function(e){
        var key_number = String.fromCharCode(e.which)
        if (key_number == "c"){
            reset_pin()
        }
        if (isNumeric(key_number)){
            flashkey(key_number)
            append_to_pin(key_number);
        }
    });

    $('.pin-input').click(function() {
        append_to_pin(this.innerHTML);
    });

    $('.reset').click(reset_pin);

    $('.back-space').click(function() {
        if (current_pin.length>0){
            current_pin = current_pin.substring(0, current_pin.length-1)
            update_pin_display();
        }
    });

});

/* -----------------------------------------------------------------------
Get URL params
    -----------------------------------------------------------------------*/
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
                = decodeURIComponent(tokens[2]);
    }

    return params;
}

/* -----------------------------------------------------------------------
CSRF token helpers
    -----------------------------------------------------------------------*/
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});