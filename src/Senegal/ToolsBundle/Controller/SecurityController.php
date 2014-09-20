<?php

namespace Senegal\ToolsBundle\Controller;

use Api\Sdk\Model\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\SecurityContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use JMS\SecurityExtraBundle\Annotation\Secure;

/**
 * Class SecurityController
 */
class SecurityController extends Controller
{
    /**
     * @param Request $request
     *
     * @Template("SenegalToolsBundle:Security:login.html.twig")
     */
    public function loginAction(Request $request)
    {
        $session = $request->getSession();
        $error = $request->attributes->get(SecurityContext::AUTHENTICATION_ERROR, $session->get(SecurityContext::AUTHENTICATION_ERROR));
        
        if (!$request->attributes->has(SecurityContext::AUTHENTICATION_ERROR)) {
            $session->remove(SecurityContext::AUTHENTICATION_ERROR);
        }

        return array(
            'last_username' => $session->get(SecurityContext::LAST_USERNAME),
            'error'         => $error,
        );
    }
    
    public function loginCheckAction()
    {
        $this->api = $this->get('senegal.api.service');            
        $resp = $this->api->get("/admin/login-check");
        echo(json_encode($resp));
    }

    /**
     * @param User $user
     * @param int  $groupId
     *
     * @Secure(roles="ROLE_BACKOFFICE_USERS_ADMIN, ROLE_BACKOFFICE_USERS_CLIENT")
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     * @throws \Symfony\Component\Security\Core\Exception\AccessDeniedException
     * @todo We should create a Group model and move the switch logic to a getSwitchRoute for example
     */
    public function loginAsAction(User $user, $groupId)
    {
        if (!$this->get('security.context')->isGranted('ROLE_BACKOFFICE_USERS_ADMIN') && !$user->isClient()) {
            throw $this->createAccessDeniedException("Vous n'avez pas les droits suffisants pour vous connecter en tant qu'un utilisateur de ce type");
        }

        $user  = $this->get('sdk_user_provider')->loadUserByUsername($user->getUsername());
        $token = new UsernamePasswordToken($user, null, 'senegal', $user->getRoles());

        $this->get('security.context')->setToken($token);
//        $this->get('senegal.bridge')->permissiveTransaction(function () use ($user) {
//            $user = \sfGuardUserPeer::retrieveByPK($user->getId());
//
//            \sfContext::getInstance()->getUser()->signIn($user, true);
//        });

        switch($groupId) {
            case \sfGuardGroupPeer::BACKOFFICE_ADMIN_GROUP_ID:
            case \sfGuardGroupPeer::BACKOFFICE_COMMERCIAL_GROUP_ID:
            case \sfGuardGroupPeer::BACKOFFICE_ANALYST_GROUP_ID:
            case \sfGuardGroupPeer::BACKOFFICE_EXPERT_GROUP_ID:
            case \sfGuardGroupPeer::BACKOFFICE_GROUP_ID:
            case \sfGuardGroupPeer::BACKOFFICE_VEILLEUR_GROUP_ID:
            case \sfGuardGroupPeer::BACKOFFICE_INVOICE_GROUP_ID:

                return $this->redirect($this->generateUrl('homepage'));

            case \sfGuardGroupPeer::PREMIUM_GROUP_ID:
            case \sfGuardGroupPeer::TPVPRO_GROUP_ID:

            return $this->redirect($this->container->getParameter('urls')['premium']);

            case \sfGuardGroupPeer::BASEFRONT_AUX_GROUP_ID:
            case \sfGuardGroupPeer::BASEFRONT_MAIN_GROUP_ID:
            case \sfGuardGroupPeer::BASEFRONT_GROUP_ID:

                return $this->redirect($this->container->getParameter('urls')['basefront']);

            case \sfGuardGroupPeer::DISTRIB_GROUP_ID :

                return $this->redirect($this->container->getParameter('urls')['distrib']);

            default:

                return $this->redirect($this->container->getParameter('urls')['front']);
        }
    }
}
