<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPhoto extends Model
{
    protected $fillable = ['section', 'group_name', 'title', 'photo_path'];
    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): string
    {
        return url("/api/landing-photos/{$this->id}/photo");
    }
}
