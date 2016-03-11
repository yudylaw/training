<?php

/**
 * 课程资源-数据模型
 * @author sjzhao
 *
 */
class CourseResourceModel extends Model {
    
    protected $tableName = 'course_resource';
    protected $error = '';
    /**
     * 增加课程资源
     */
    public function addCourseResource($param){
        $data = array();
        $data['title'] = $param['title'];
        $data['utime'] = time();
        $data['ext'] = "ext";
        $data['description'] = $param['description'];
        $data['course_id'] = $param['course_id'];
        $data['save_path'] = $param['save_path'];
        //echo json_encode($data);die;
        return $this->add($data);
    }
    /**
     * 根据条件获取资源
     * @param array $param
     */
    public function getResourceByCondition($param) {
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        $map['course_id'] = $param['course_id'];
        if (!empty($param['description'])){
            $map['description'] = array('like','%'.$param['description'].'%');
        }
        $page = !empty($param['page']) ? $param['page'] : 1;
        $limit = !empty($param['limit']) ? $param['limit'] : 5;
        $result = $this->where($map)->order('utime desc')->findPage($limit);
        $resdata = $result['data'];
        $coursemodel = model('Course');
        $courselearningmodel = model('CourseResourceLearning');
        foreach ($resdata as $key=>$val){
            $course = $coursemodel->getCourseByCondition(array('id'=>$val['course_id']));
            $course = $course[0];
            $result['data'][$key]['coursetitle'] = $course['title'];
            $result['data'][$key]['creator'] = $course['creator'];
            $result['data'][$key]['subject'] = $course['subject'];
            $result['data'][$key]['required'] = $course['required'];
            $learning = $courselearningmodel->getCourseLearningByCondition(array('resourceid'=>$val['id'],'uid'=>$param['uid']));
            $result['data'][$key]['percent'] = $learning['percent'];
        }
        return $result;
    }
    /**
     * 根据资源id获取资源信息
     * @param int $id
     */
    public function getResourceById($id){
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        $map['id'] = $id;
        return $this->where($map)->select();
    }
}