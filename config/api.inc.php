<?php
/*
 * 游客访问的黑/白名单，不需要开放的，可以注释掉
 * 此处只配置不能后台修改的项目
 */
return array(
	"access" => array(
		'Oauth/*'        => true,
		'ProductShare/*' => true,
		'Public/*'       => true,
	) 
);