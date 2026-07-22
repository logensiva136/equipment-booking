from django.db import models


class BmiPost(models.Model):
    class Category(models.TextChoices):
        UNDERWEIGHT = 'underweight', 'Underweight'
        NORMAL = 'normal', 'Normal'
        OVERWEIGHT = 'overweight', 'Overweight'
        OBESE = 'obese', 'Obese'

    class Key(models.TextChoices):
        EXERCISE = 'exercise', 'Exercise'
        MEALS = 'meals', 'Meal recommendations'
        WATER = 'water', 'Water intake'
        CALORIES = 'calories', 'Daily calories'

    category = models.CharField(max_length=20, choices=Category.choices)
    key = models.CharField(max_length=20, choices=Key.choices)
    title = models.CharField(max_length=100)
    body = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('category', 'key')
        ordering = ['category', 'key']

    def __str__(self):
        return f'{self.category}/{self.key}'


class Exercise(models.Model):
    class Category(models.TextChoices):
        STRETCHING = 'stretching', 'Stretching'
        STRENGTH = 'strength', 'Strength Training'

    class Level(models.TextChoices):
        BEGINNER = 'Beginner', 'Beginner'
        INTERMEDIATE = 'Intermediate', 'Intermediate'
        ADVANCED = 'Advanced', 'Advanced'

    title = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=Category.choices)
    duration = models.CharField(max_length=30)
    level = models.CharField(max_length=20, choices=Level.choices)
    description = models.TextField()

    class Meta:
        ordering = ['category', 'title']

    def __str__(self):
        return self.title
