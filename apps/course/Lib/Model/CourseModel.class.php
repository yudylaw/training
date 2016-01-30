<?php

/**
 * 课程-数据模型
 * @author sjzhao
 *
 */
class CourseModel extends Model {
    
    protected $tableName = 'course';
    protected $error = '';
    /**
     * 根据条件查询课程
     * @param array $param
     */
    public function getCourseByCondition($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        if (!empty($param['title'])){
            $map['title'] = array('like','%'.$param['title'].'%');
        }
        if(!empty($param['id'])){
            $map['id'] = $param['id'];
        }
        $result = $this->where($map)->findAll();
        return $result;
    }
    /**
     * 创建课程
     * @param array $param
     */
    public function addCourse($param){
        $data = array();
        $data['title'] = $param['title'];
        $data['creator'] = $param['creator'];
        $data['subject'] = $param['subject'];
        $data['required'] = $param['required'];
        $data['description'] = $param['description'];
        $data['ctime'] = time();
        return $this->add($param);
    }
    /**
     * 更新课程
     * @param array $param
     */
    public function updateCourse($param) {
        $map['id'] = $param['id'];
        if(!empty($param['title'])){
            $data['title'] = $param['title'];
        }
        if(!empty($param['creator'])){
            $data['creator'] = $param['creator'];
        }
        if(!empty($param['subject'])){
            $data['subject'] = $param['subject'];
        }
        if(!empty($param['is_del'])){
            $data['is_del'] = $param['is_del'];
        }
        //删除课程资源
        if(!empty($param['resourceid'])){
            $map2['id'] = array("IN",array($param['resourceid']));
            M('CourseResource')->where($map2)->save(array('is_del'=>1));
        }
        return $this->where($map)->save($data);
    }
    
    public function getCourseList($param){
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        $page = !empty($param['page']) ? $param['page'] : 1;
        $limit = !empty($param['limit']) ? $param['limit'] : 5;
        $result = $this->where($map)->order('ctime desc')->findPage($limit);
        $resdata = $result['data'];
        $courselearningmodel = model('CourseLearning');
        foreach ($resdata as $key=>$val){
            $courselearning = $courselearningmodel->getCourseLearningByCondition(array('course_id'=>$val['id']));
            !empty($courselearning) && $courselearning = $courselearning[0];
            $result['data'][$key]['start_date'] = $courselearning['start_date'];
            $result['data'][$key]['end_date'] = $courselearning['end_date'];
            $result['data'][$key]['percent'] = $courselearning['percent'];
        }
        return $result;
    }
}