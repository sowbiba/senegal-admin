<?php

namespace Senegal\UserBundle\Form\Transformer;

use Symfony\Component\Form\DataTransformerInterface;

class DateTimeToStringTransformer implements DataTransformerInterface
{
    /**
     * Transform date (DateTime) to string
     *
     * @param mixed $date
     *
     * @return mixed|null
     */
    public function transform($date)
    {
        return $date ? $date->format('d/m/Y') : null;
    }

    /**
     * Transform String to date (DateTime)
     *
     * @param mixed $dateString
     *
     * @return \DateTime|mixed
     */
    public function reverseTransform($dateString)
    {
        $format = preg_match('/.*\/.*\/.*/', $dateString) ? 'd/m/Y' : 'Y-m-d';

        return $dateString ? \DateTime::createFromFormat($format, $dateString) : null;
    }
}
