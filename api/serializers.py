from rest_framework import serializers
from todo.models import Todo


class TodoSerializer(serializers.ModelSerializer):
    # auto populated by app. User can't manipulate
    created = serializers.ReadOnlyField()
    completed = serializers.ReadOnlyField()
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Todo
        fields = '__all__'
        read_only_fields = ['id', 'created', 'completed', 'user']

class TodoToggleCompleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields =['id']
        read_only_fields = ['title','memo','created','completed'] 

#  Note: Because	the	TodoToggleCompleteSerializer	doesn’t	receive	and	update	any	of
# the	fields	values	from	the	endpoint	(it	just	toggles	completed),	we	set	the	fields
# to	read	only	by	specifying	them	in	the	Meta	shortcut	option	read_only_fields.