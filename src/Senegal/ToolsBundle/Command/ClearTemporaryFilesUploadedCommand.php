<?php

namespace Senegal\ToolsBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

/**
 * Clear the uploaded temporary files
 *
 * @author Nicolas MOULIN <nimo.moulin@gmail.com>
 */
class ClearTemporaryFilesUploadedCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('profideo:clear:temporary-files-uploaded')
            ->setDescription('Clear the temporary files uploaded')
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $realUploadTmpDir = $this->getContainer()->getParameter('upload_tmp_dir');

        /**
         * @var \Symfony\Component\Filesystem\Filesystem $filesystem
         */
        $filesystem = $this->getContainer()->get('filesystem');

        if (!is_writable($realUploadTmpDir)) {
            throw new \RuntimeException(sprintf('Unable to write in the "%s" directory', $realUploadTmpDir));
        }

        // Found all files in $realUploadTmpDir
        $finder = new Finder();
        $finder->files()->in($realUploadTmpDir);

        if ($finder->count()) {
            /**
             * @var \Symfony\Component\Finder\SplFileInfo $file
             */
            $filesPaths = [];
            foreach ($finder as $file) {
                $filesPaths[] = $file->getRealpath();
            }

            // Remove all temporary files in $realUploadTmpDir
            $output->writeln(sprintf('Clearing %d temporary files uploaded', $finder->count()));
            $filesystem->remove($filesPaths);
        } else {
            $output->writeln('No temporary files uploaded to delete');
        }
    }
}
