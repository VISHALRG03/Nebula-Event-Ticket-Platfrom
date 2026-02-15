package com.example.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Events {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String artist;
    private String location;
    private String date;
    private String time;
    private String imageUrl;


    //GETTERS

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getArtist() {  return artist; }
    public String getLocation() {  return location;  }
    public String getDate() {  return date;  }
    public String getTime() {  return time;  }
    public String getImageUrl() {  return imageUrl; }



    // SETTERS

    public void setId(Long id) {
        this.id = id;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setArtist(String artist) {
        this.artist = artist;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public void setDate(String date) {
        this.date = date;
    }
    public void setTime(String time) {
        this.time = time;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


}
