<?php

namespace Senegal\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Symfony\Component\HttpFoundation\Request;
use Senegal\ApiBundle\Entity\Users as User;

class UserController extends Controller
{
    public function indexAction()
    {
        $api = $this->get('senegal.api.service');
        $documents = json_decode($api->get("/contract/all/documents"));
        return $this->render('SenegalUserBundle:User:documents.html.twig', array('documents' => $documents));
    }
    
    public function editAction(Request $request, $id)
    {
        $api = $this->get('senegal.api.service');
        $user = json_decode($api->get("/users/" . $id));

        $form     = $this->get('form.factory')->createNamed('', 'user', $user, array(
            'validation_groups' => array('Default', 'create')
        ));
        
        if ('POST' == $request->getMethod()) {
            //$revisionForm->submit($request);
            $postValues = $form->getData();var_dump($postValues);
            
            $api = $this->get('senegal.api.service');
            $result = json_decode($api->post("/user/save/" . $id));var_dump($result);
        }
        
        return $this->render('SenegalUserBundle:User:edit.html.twig', 
                array(
                    'form' => $form->createView()
                    )
                );
    }
    
    public function deleteAction($id)
    {
        $api = $this->get('senegal.api.service');
        $user = json_decode($api->get("/user/" . $id));
        return $this->render('SenegalUserBundle:User:edit.html.twig', array('user' => $user));
    }
    
    public function usersAction()
    {
        $api = $this->get('senegal.api.service');
        $users = json_decode($api->get("/all/users"));
        return $this->render('SenegalUserBundle:User:users.html.twig', array('users' => $users));
    }
}
