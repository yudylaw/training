<?php

class ClassroomRole {

    const MEMBER = 1;//成员
    const CLASSROOM_ADMIN = 3;//班级管理员
    
    public static function getRoles() {
        return array(ClassroomRole::MEMBER, ClassroomRole::CLASSROOM_ADMIN);
    }
    
    public static function hasRole($value) {
        return in_array($value, ClassroomRole::getRoles());
    }
    
    //转换班级角色到平台角色
    public static function getUserGroup($classroomRole) {
        if ($classroomRole == ClassroomRole::CLASSROOM_ADMIN) {
            return Role::CLASS_ADMIN;
        } else {
            return Role::TEACHER;
        }
    }
    
}