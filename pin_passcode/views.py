from django.conf import settings
from django.contrib.auth import login, get_user_model
from django.shortcuts import render, HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import requires_csrf_token
from django.middleware.csrf import get_token
from videos.models import Video


@requires_csrf_token
def form(request):
    get_token(request)
    total_watch_time, total_duration = 0, 0
    for duration in Video.objects.all().values_list('duration'):
        total_duration += duration[0].seconds

    for watch_time in Video.all_objects.all().values_list('watch_time'):
        total_watch_time += watch_time[0]

    h, m = divmod(total_watch_time/60, 60)
    if h:
        total_watch_time = f"{int(h)} hrs {int(m)} mins"
    else:
        total_watch_time = f"{int(m)} mins"

    ctx = {
        "watch_time" : total_watch_time,
        "duration" : f"{int(total_duration / 3600)} hrs"
    }

    return render(request, 'pin_passcode/form.html', ctx)


@requires_csrf_token
def auth(request):
    if request.method == 'POST':
        received_pin = request.POST.get('pin', None)
        actual_pin_code = getattr(settings, 'PIN_PASSCODE_PIN', None)
        if not actual_pin_code:
            raise Exception("PIN_PASSCODE_PIN setting not set!")
        next_page = request.GET.get('next', '/')

        if received_pin == str(actual_pin_code):
            username = getattr(settings, 'PIN_PASSCODE_USERNAME', None)
            if username:
                try:
                    user = get_user_model().objects.get(username=username)
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    login(request, user)
                    return HttpResponse(status=200)
                except get_user_model().DoesNotExist:
                    raise Exception("User %s not found!" % username)
            else:
                # No username defined, so let's just set a flag in the session
                request.session["pin_passcode_logged_in"] = True
                return HttpResponseRedirect(next_page)
        else:
            return HttpResponse(status=401)


def test(request):
    '''This view is just for testing, you shouldn't be able to get to it unless
    you are authed from django or PIN PASSCODE'''
    return HttpResponse()
