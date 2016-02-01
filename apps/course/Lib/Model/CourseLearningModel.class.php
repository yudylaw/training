<?php

/**
 * 课程学习-数据模型
 * @author sjzhao
 *
 */
class CourseLearningModel extends Model {
    
    protected $tableName = 'course_learning';
    protected $error = '';
    /**
     * 添加课程学习记录
     * @param array $param
     */
    public function addCourseLearning($param) {
        $data = array();
        $data['class_id'] = $param['class_id'];
        $data['uid'] = $this->uid;
        $data['subject'] = $param['subject'];
        $data['course_id'] = $param['course_id'];
        $data['ctime'] = time();
        $data['start_date'] = time();
        if(!empty($param['end_date'])){
            $data['end_date'] = $param['end_date'];
        }
        if(!empty($param['percent'])){
            $data['percent'] = $param['percent'];
        }
        $is_exist = $this->where(array('class_id'=>$data['class_id'],'uid'=>$data['uid'],'course_id'=>$data['course_id']))->find();
        if(empty($is_exist)){
            return $this->add($data);
        }else{
            if($param['percent'] == 100){
                $toupdate['end_date'] = time();//学习完成记录完成时间
            }
            $toupdate['percent'] = $param['percent'];
            return $this->where((array('class_id'=>$data['class_id'],'uid'=>$data['uid'],'course_id'=>$data['course_id'])))->save($toupdate);
        }
    }
    /**
     * 更新课程学习记录
     * @param array $param
     */
    public function updateCourseLearning($param){
        $data = array();
        $map['id'] = $param['course_id'];
        if(!empty($param['percent'])){
            $data['percent'] = $param['percent'];
        }
        if(!empty($param['end_date'])){
            $data['end_date'] = $param['end_date'];
        }
        if(!empty($param['is_del'])){
            $data['is_del'] = $param['is_del'];
        }
        $this->where($map)->save($data);
    }
    
    /**
     * 根据条件查询课程学习记录
     * @param array $param
     */
    public function getCourseLearningByCondition($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        $page = !empty($param['page']) ? $param['page'] : 1;
        $limit = !empty($param['limit']) ? $param['limit'] : 5;
        $result = $this->where($map)->order('ctime desc')->findPage($limit);
        $resdata = $result['data'];
        $coursemodel = model('Course');
        foreach ($resdata as $key=>$val){
            $course = $coursemodel->getCourseByCondition(array('id'=>$val['course_id']));
            $course = $course[0];
            $result['data'][$key]['title'] = $course['title'];
            $result['data'][$key]['creator'] = $course['creator'];
            $result['data'][$key]['subject'] = $course['subject'];
            $result['data'][$key]['required'] = $course['required'];
        }
//         return $this->getLastSql();
        return $result;
    }
    
}