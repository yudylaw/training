<?php

require_once ADDON_PATH."/library/ks3-php-sdk/Ks3Client.class.php";

function putObjectByFile($filepath, $ext){

    $file = fopen($filepath,"r");
    
    $client = new Ks3Client("h8JH8Vay5+Lt471kMbJM","password", "kssws.ks-cdn.com");
    
    $md5 = md5(time());

    $filename = '827621043-0-827645026-'.time().'-'.$md5.'@2.bucket.ks3.mi.com.'.$ext;

    $content = $file;

    $args = array(
        "Bucket"=>"2.bucket.ks3.mi.com",
        "Key"=>$filename,
        "ACL"=>"public-read",
        "Content"=>array(
            "content"=>$file,
            "seek_position"=>0
        ),
    );
    $etag = $client->putObjectByFile($args);
    $url = "http://kssws.ks-cdn.com/2.bucket.ks3.mi.com/".$filename;
    return $url;
}