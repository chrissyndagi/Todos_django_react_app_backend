# imports for authentication
from django.db import IntegrityError
from django.contrib.auth.models import User
from rest_framework.parsers import JSONParser
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# implementing login in
from django.contrib.auth import authenticate



from rest_framework import generics, permissions
from todo.models import Todo
from .serializers import TodoSerializer, TodoToggleCompleteSerializer


class TodoList(generics.ListCreateAPIView):
    # #ListAPIView requires two mandatory attributes, serializer_class and queryset.
    # queryset = Todo.objects.all
    serializer_class = TodoSerializer

    # adding permissions to only authenticated users to access our todos
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Todo.objects.filter(user=user).order_by('-created')

# get_queryset	returns	the	queryset	of	todo	objects	for	the	view.	In	our	case,	we
# specify	the	query	set	as	all	todos	which	match	the	user.	Additionally,	we	order
# the	todos	by	the	created	date	i.e.	we	show	the	latest	todo	first.	You	can	customize
# get_queryset	to	return	the	set	of	todos	that	you	want.

    def perform_create(self,serializer):
        #serializer holds a django model
        serializer.save(user=self.request.user)

class TodoEdit(generics.RetrieveUpdateDestroyAPIView):
    
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        #user can only update, delete own posts
        return Todo.objects.filter(user=user)
    

class TodoToggleComplete(generics.UpdateAPIView):
    serializer_class = TodoToggleCompleteSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        user = self.request.user
        return Todo.objects.filter(user=user)
    
    def perform_update(self, serializer):
        serializer.instance.completed=not(serializer.instance.completed)
        serializer.save()

@csrf_exempt
def signup(request):

    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            user = User.objects.create_user(
                username=data['username'],
                password=data['password']
            )
            user.save()
            token = Token.objects.create(user=user)
            return JsonResponse({'token':str(token.key)},status=201)
        except IntegrityError:
            return JsonResponse(
                {'error':'username taken. choose another username'},status=400)
    return JsonResponse(
    {'error': 'POST request required'},
    status=400
)
# login view
@csrf_exempt
def login(request):
    if request.method == 'POST':
        
            data = JSONParser().parse(request)
            user = authenticate(request,
                username=data['username'],
                password=data['password']
            )
    if user is None:
        return JsonResponse(
            {'error':'unable to login.check username and password'},status=400
        )
    else: # return user token
        try:
            token = Token.objects.get(user=user)
        except:# if token not in db, create a new one
            token = Token.objects.create(user=user)
        return JsonResponse({'token':str(token)}, status=201)
