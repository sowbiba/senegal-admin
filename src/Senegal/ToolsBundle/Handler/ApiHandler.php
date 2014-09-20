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
    
    public function post($url, $data_string = "")
    {
        curl_setopt($this->curl, CURLOPT_URL, $this->host . $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data_string))
        );

        $result = curl_errno($this->curl) ? false :curl_exec($this->curl);

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
