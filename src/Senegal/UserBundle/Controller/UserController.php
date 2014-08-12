<?php

namespace Senegal\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use JMS\SecurityExtraBundle\Annotation\Secure;

class UserController extends Controller
{
    private $api;
    
    public function load()
    {
        //var_dump("LOAD");
    }
    
    public function indexAction()
    {
        $this->api = $this->get('SenegalApiService');
        return $this->getAllDocuments();
        //return $this->render('SenegalUserBundle:User:index.html.twig', array('name' => $name));
    }
    
    /**
     * @Secure(roles="ROLE_USER")
     * @return type
     */
    public function getAllDocuments() {
        $documents = json_decode($this->api->get("/contract/all/documents"));
        return $this->render('SenegalUserBundle:User:documents.html.twig', array('documents' => $documents));
    }
}
