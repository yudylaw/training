<?php

/**
 * 课程资源学习-数据模型
 * @author sjzhao
 *
 */
class CourseResourceLearningModel extends Model {
    
    protected $tableName = 'course_resource_learning';
    protected $error = '';
    /**
     * 根据条件获取资源学习记录
     * @param array $param
     */
    public function getCourseLearningByCondition($param){
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        if(!empty($param['resourceid'])){
            $map['resourceid'] = $param['resourceid'];
        }
        if(!empty($param['uid'])){
            $map['uid'] = $param['uid'];
        }
        if(!empty($param['classid'])){
            $map['classid'] = $param['classid'];
        }
        $result = $this->where($map)->order('ctime desc')->select();
        return $result;
    }
    /**
     * 添加学习记录
     */
    public function addResLearning(){
        
    }
}