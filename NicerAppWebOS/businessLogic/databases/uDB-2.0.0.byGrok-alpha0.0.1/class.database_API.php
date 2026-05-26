<?php
$myPath_BLdbs = realpath(dirname(__FILE__).'/../../../');
global $myPath_BLdbs;

require_once ($myPath_BLdbs.'/boot.php');
require_once (__DIR__.'/functions.php');
require_once (__DIR__.'/uDB-2.5.1.class.byGrok.php');

class class_NicerAppWebOS_database_API {

    public $cn = 'class_NicerAppWebOS_database_API';
    public $settings = [];
    public $connections = [];

    public function __construct($username = 'Guest', $dbsConfigFile = null) {
        $this->connections = $this->connectToDatabases($username, $dbsConfigFile);
        return $this;
    }

    public function connectToDatabases($username = 'Guest', $dbsConfigFile = null) {
        global $naWebOS;
        global $myPath_BLdbs;
        $ret = [];

        // Guest / normal user analytics DB
        if ($username !== 'admin' && $username !== 'Guest') {
            $cRec = [
                "driver"      => "couchdb",
                "host"        => "127.0.0.1",
                "port"        => "5984",
                "useSSL"      => false,
                "httpAdapter" => "HTTP_CURL",
                "database"    => "analytics",
                "username"    => $naWebOS->domainFolderForDB . '___' . $username
            ];

            $ret[] = [
                'ct'   => 'couchdb',
                'cRec' => $cRec,
                'conn' => uDB2::createFromConfig($cRec, $username)
            ];
        }

        // Admin / full databases
        if (true || $username === 'admin') {
            $domainConfigsPath = realpath($myPath_BLdbs . '/../../') . '/domains/' . $naWebOS->domainFolder . '/domainConfig/';
            $configFilename = 'databases.username-' . $username . '.json';

            if (!file_exists($domainConfigsPath . $configFilename)) {
                $configFilename = 'databases.username-Guest.json';
            }

            if (is_null($dbsConfigFile)) {
                $dbsConfigFile = $domainConfigsPath . $configFilename;
            }

            $exampleConfigFile = $domainConfigsPath . '/databases.jsonConfigFiles.EXAMPLES/' . $configFilename;
            $p = safeLoadJSONfile($dbsConfigFile, $exampleConfigFile);
            $this->settings = $p;

            foreach ($p['databases'] ?? [] as $ct => $cRec) {
                if (empty($cRec['driver'])) $cRec['driver'] = $ct;

                $ret[] = [
                    'ct'   => $ct,
                    'cRec' => $cRec,
                    'conn' => uDB2::createFromConfig($cRec, $username)
                ];
            }
        }

        $this->connections = $ret;
        return $ret;
    }

    public function findConnection($ct = 'couchdb') {
        foreach ($this->connections as $conn) {
            if ($conn['ct'] === $ct || $ct === 'couchdb') {
                if (!empty($conn['conn'])) {
                    return $conn['conn'];
                }
            }
        }
        return null;
    }

    public function setDatabase($databaseName) {
        $conn = $this->findConnection('couchdb');
        if ($conn) {
            return $conn->setDatabase($databaseName);
        }
        return false;
    }

    public function toArray($input) {
        $conn = $this->findConnection('couchdb');
        if ($conn) {
            return $conn->toArray($input);
        }
        // fallback
        if (is_object($input)) {
            return json_decode(json_encode($input), true);
        }
        return is_array($input) ? $input : [];
    }

    // ====================== BACKWARD COMPATIBILITY ======================

    public function connectToDatabase($username, $ct = null, $cRec = null) {
        // Mostly deprecated - kept for safety
        return $this->findConnection($ct);
    }

    public function getNewRandomIDs($relTableName, $fieldName) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->getNewRandomIDs($relTableName, $fieldName) : [];
    }

    public function getAllDatabases() {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->getAllDatabases() : [];
    }

    public function listDatabases($allDBs, $dbs, $dbsReset) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->listDatabases($allDBs, $dbs, $dbsReset) : '';
    }

    public function clearOutDatabases($dbs) {
        return $this->callAllDataSets('clearOutDatabases', [$dbs]);
    }

    public function setGlobals($username) {
        return $this->callAllDataSets('setGlobals', [$username]);
    }

    public function createUsers($users, $groups) {
        return $this->callAllDataSets('createUsers', [$users, $groups]);
    }

    public function listUsers() {
        return $this->callAllDataSets('listUsers');
    }

    public function createDatabases($dbs) {
        return $this->callAllDataSets('createDatabases', [$dbs]);  // let uDB2 handle it
    }

    public function resetDatabases($dbs) {
        return $this->callAllDataSets('resetDatabases', [$dbs]);
    }

    public function standardResultHandling($c, $resultValue) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->standardResultHandling($c, $resultValue) : ['result' => false];
    }

    public function callAllDataSets($functionName, $params = null) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->callAllDataSets($functionName, $params) : [];
    }

    public function callDataSet($ct, $functionName, $params = null) {
        $uDB = $this->findConnection($ct);
        return $uDB ? $uDB->callDataSet($ct, $functionName, $params) : [];
    }

    public function addLogEntries($entries) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->addLogEntries($entries) : [];
    }

    public function testDBconnection() {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->testDBconnection() : [];
    }

    public function editDataSubSet($ct = null, $relTableName = null, $findCommand = null, $recordOverlay = null) {
        return $this->callDataSet($ct, 'editDataSubSet', [$relTableName, $findCommand, $recordOverlay]);
    }

    public function cms_editDocument() {
        return $this->callAllDataSets('cms_editDocument');
    }

    public function editDataByUsers($findCommand = null, $dataIDs = null, $dataIDs_idx = null) {
        return $this->callAllDataSets('editDataByUsers', [$findCommand, $dataIDs, $dataIDs_idx]);
    }

    public function changeThemeName($oldThemeName, $newThemeName) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->changeThemeName($oldThemeName, $newThemeName) : false;
    }

    public function delete_allThemes_byName($themeName) {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->delete_allThemes_byName($themeName) : false;
    }

    public function getSettingsPositions() {
        $uDB = $this->findConnection('couchdb');
        return $uDB ? $uDB->getSettingsPositions() : false;
    }

    // Magic method to catch any remaining old calls
    public function __call($method, $args) {
        $uDB = $this->findConnection('couchdb');
        if ($uDB && method_exists($uDB, $method)) {
            return call_user_func_array([$uDB, $method], $args);
        }

        trigger_error("Method {$method}() not found in class.database_API or uDB2", E_USER_WARNING);
        return null;
    }
}
