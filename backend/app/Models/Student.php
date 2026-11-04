<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = ['name', 'nisn', 'major', 'kelas', 'quote', 'photo_path'];
    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? url("/api/students/{$this->id}/photo") : null;
    }
}
