package com.example.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ItemController {

    @GetMapping("/items")
    public List<Map<String, Object>> items() {
        return List.of(
            Map.of("id", 1, "name", "노트북", "price", 1500000),
            Map.of("id", 2, "name", "마우스", "price", 35000),
            Map.of("id", 3, "name", "키보드", "price", 89000)
        );
    }
}
