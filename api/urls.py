from django.urls import path
from . import views  


urlpatterns = [
    path('todos/',views.TodoList.as_view(), name='todos'), 
    path('todos/<int:pk>/', views.TodoEdit.as_view(), name='todo_list'),
    path('todos/<int:pk>/complete/', views.TodoToggleComplete.as_view(), name='toggle_complete'),
    path('signup/',views.signup),
    path('login/',views.login),
    ]