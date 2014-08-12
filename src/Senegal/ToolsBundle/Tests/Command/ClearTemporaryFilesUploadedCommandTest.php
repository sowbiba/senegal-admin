<?php

namespace Senegal\ToolsBundle\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Senegal\ToolsBundle\Command\ClearTemporaryFilesUploadedCommand;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

class ClearTemporaryFilesUploadedCommandTest extends WebTestCase
{
    private $kernelTest;
    private $application;
    private $storagePath;

    public function setUp()
    {
        $this->kernelTest = static::createKernel();
        $this->kernelTest->boot();
        $this->application = new Application($this->kernelTest);
        $this->application->setAutoExit(false);

        $this->storagePath = $this->application->getKernel()->getContainer()->getParameter('upload_tmp_dir');
    }

    public function testExecute()
    {
        $this->application->add(new ClearTemporaryFilesUploadedCommand());

        $filesystem  = new Filesystem();
        $filesystem->touch($this->storagePath . 'test.txt');

        $finder = new Finder();
        $finder->files()->in($this->storagePath);

        $this->assertCount(1, $finder);

        $command = $this->application->find('profideo:clear:temporary-files-uploaded');
        $commandTester = new CommandTester($command);
        $commandTester->execute(array('command' => $command->getName()));

        $this->assertEquals($commandTester->getDisplay(), "Clearing 1 temporary files uploaded\n");

        $finder->files()->in($this->storagePath);

        $this->assertEmpty($finder->count());
    }

    public function testExecuteNoFiles()
    {
        $this->application->add(new ClearTemporaryFilesUploadedCommand());

        $command = $this->application->find('profideo:clear:temporary-files-uploaded');
        $commandTester = new CommandTester($command);
        $commandTester->execute(array('command' => $command->getName()));

        $this->assertEquals($commandTester->getDisplay(), "No temporary files uploaded to delete\n");

        $finder = new Finder();
        $finder->files()->in($this->storagePath);

        $this->assertEmpty($finder->count());
    }

    /**
     * @expectedException RuntimeException
     */
    public function testExecuteWithRuntimeException()
    {
        $originalPermissions = $this->getFilePermissions($this->storagePath);
        $filesystem          = new Filesystem();
        $filesystem->chmod($this->storagePath, 0555);

        try {
            $this->application->add(new ClearTemporaryFilesUploadedCommand());

            $command = $this->application->find('profideo:clear:temporary-files-uploaded');
            $commandTester = new CommandTester($command);
            $commandTester->execute(array('command' => $command->getName()));
        } catch (\RuntimeException $e) {
            // Restaure permissions
            $filesystem->chmod($this->storagePath, octdec($originalPermissions));

            $this->assertEquals($originalPermissions, $this->getFilePermissions($this->storagePath));

            throw $e;
        }
    }

    /**
     * Returns file permissions as three digits (i.e. 755)
     *
     * @param string $filePath
     *
     * @return integer
     */
    private function getFilePermissions($filePath)
    {
        return substr(sprintf('%o', fileperms($filePath)), -4);
    }
}
