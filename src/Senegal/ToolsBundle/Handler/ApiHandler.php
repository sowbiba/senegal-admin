<?php
namespace Senegal\ToolsBundle\Handler;
/**
 * Singleton used to call Senegal API
 */
class ApiHandler
{
    /**
     * @var ApiHandler|null
     */
    private static $_instance = null;

    /**
     * API host
     *
     * @var string
     */
    private $host;

    /**
     * Curl resource
     *
     * @var resource
     */
    private $curl;

    /**
     * Call local config to get API host url and init Curl
     */
    public function __construct($host)
    {
        $this->host = $host;
        $this->initCurl();
    }

    /**
     * @return ApiHandler instance
     */
    public static function getInstance()
    {

        if (is_null(self::$_instance)) {
            self::$_instance = new ApiHandler();
        }

        return self::$_instance;
    }

    /**
     * Initialize a Curl resource
     */
    private function initCurl() {
        $curl = curl_init();

        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FAILONERROR, true);

        $this->curl = $curl;
    }

    /**
     * Call api to get a resource
     *
     * @param string $url Resource url
     *
     * @return string Resource
     *
     * @throws BadMethodCallException When $url is null
     */
    public function get($url){

        if(null === $url){
            throw new BadMethodCallException("url parameter can not be null");
        }

        curl_setopt($this->curl, CURLOPT_URL, $this->host . $url);

        $result = curl_errno($this->curl) ? false :curl_exec($this->curl);

        return $result;
    }
    
    public function post($url, $data = array())
    {
        $data = json_encode($data);
        var_dump($data);

        $this->curl = curl_init($this->host . $url);
        //curl_setopt($this->curl, CURLOPT_URL, $this->host . $url);
        curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
        curl_setopt($this->curl, CURLOPT_POSTFIELDS, $data);                                                                  
        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);                                                                      
        curl_setopt($this->curl, CURLOPT_HTTPHEADER, array(                                                                          
            'Content-Type: application/json',                                                                                
            'Content-Length: ' . strlen($data))                                                                       
        );   
//        curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, "POST");
//        curl_setopt($this->curl, CURLOPT_POSTREDIR, 3);
//        curl_setopt($this->curl,CURLOPT_HEADER, false);
//        curl_setopt($this->curl, CURLOPT_POST, count($data));
//        curl_setopt($this->curl, CURLOPT_POSTFIELDS, http_build_query($data));
//        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, 1); // RETURN THE CONTENTS OF THE CALL
//        curl_setopt($this->curl, CURLOPT_HTTPHEADER, array(
//            "Accept: application/json",
//            'Content-Type: application/json')
//            //'Content-Length: ' . strlen($data))
//        );

        var_dump(curl_errno($this->curl));
        $c = curl_exec($this->curl);
        $result = curl_errno($this->curl) > 0 ? false :curl_exec($this->curl);
        
        curl_close($this->curl);
        return $result;
    }

    /**
     * Close Curl resource
     */
    public function __destruct()
    {
        curl_close($this->curl);
    }
}
