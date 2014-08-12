<?php
/**
 * Created by JetBrains PhpStorm.
 * User: fcoquel
 * Date: 29/03/13
 * Time: 15:05
 * To change this template use File | Settings | File Templates.
 */

namespace Senegal\ToolsBundle\Listener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\HttpKernel;

class IpRestrictionListener
{
  public function onKernelRequest(GetResponseEvent $event)
  {
    if (HttpKernel::MASTER_REQUEST === $event->getRequestType()) {
      // custom logic
      //if ('127.0.0.1' !== $event->getRequest()->getClientIp()) {
      //  throw new AccessDeniedHttpException("Access not authorized");
      //}
    }
  }
}
