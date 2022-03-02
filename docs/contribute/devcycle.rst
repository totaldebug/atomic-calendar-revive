#################
Development Cycle
#################

The below will provide a guide on how you should develop for this plugin to have your
code reviewed and accepted.

****************
Setup Repository
****************

* Fork the repo in `github <https://github.com/totaldebug/atomic-calendar-revive>`_
* Clone the project to your development machine

.. code-block:: bash

    git clone https://github.com/your-username/atomic-calendar-revive.git

*******************
Create Topic Branch
*******************

You should always work on a new topic branch for each feature / bug you are working on.
Also you must ensure that you have pulled the latest version from upstream see below.

Start by setting up an upstream remote, this will be used to pull the latest version
from the main repository:

.. code-block:: bash

      git remote add upstream https://github.com/totaldebug/atomic-calendar-revive


Checkout the master branch and pull the latest upstream version:

.. code-block:: bash

      git checkout master
      git fetch upstream
      git merge upstream/master
      git push

Your fork should now be in sync with the main totaldebug repository, now a new branch
is required for development.

.. code-block:: bash

      git checkout -b <issue-number>_<feature/bug-name>
      git checkout -b 100_Fix-the-bug


.. note::

   The branch should have a relevant short name starting with the issue number
   and then having a name for the fix / feature as shown in the example above.

********************
Install Dependencies
********************

From the cloned repository, run the command to install the requirements:

.. code-block:: bash

      yarn install

********************
Make changes & Build
********************

#. Any changes to the card should be made in the folder ``src``
#. Update the version number in ``package.json``
#. Run the command ``yarn run build`` to create the latest distribution file

*******
Testing
*******

There are no automated tests for this project, however it is expected that any
development work is tested against a HA Server with both CalDav and Google Calendar
attached, this ensures no advers impact is added with the feature or bugfix.

**********
Versioning
**********

This project follows `Semantic Versioning <http://semver.org>`_

**MAJOR.MINOR.PATCH**

In the context of semantic versioning, the following should apply:

* **Major** - A breaking change that requires user invervention, or a change to a
  default value.
* **Minor** - A change that does not require intervention, or adds additional
  functionality in a backwards compatible manner.
* **Patch** - A change that resolves a specific bug.

All changes are tracked in the `release notes <https://github.com/totaldebug/atomic-calendar-revive/releases>`_


**************
Commit Changes
**************

Once you are happy with the changes, these can be committed:

.. code-block:: bash

    git add .
    git commit -v -m "feat: 100 Added new feature"

.. note::

    Commit messages should follow `conventional commits <https://www.conventionalcommits.org/en/v1.0.0/>`_
    this ensures clear commit messages within the repository.


*******************
Submit Pull Request
*******************

Once development & testing are completed a pull request can be submitted for
the change that is required, ensure that all tests are passing and once they
are a member of the team will review the request, test and merge if appropriate
