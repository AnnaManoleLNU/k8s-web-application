/**
 * @file Defines the TaskController class.
 * @module controllers/TaskController
 * @author Mats Loock
 * @version 3.1.0
 */

import { logger } from '../config/winston.js'
import { TaskModel } from '../models/TaskModel.js'
import amqp from 'amqplib'

/**
 * Encapsulates a controller.
 */
export class TaskController {

  /**
   * Provide req.doc to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadTaskDocument(req, res, next, id) {
    try {
      logger.silly('Loading task document', { id })

      // Get the task document.
      const taskDoc = await TaskModel.findById(id)

      // If the task document is not found, throw an error.
      if (!taskDoc) {
        const error = new Error('The task you requested does not exist.')
        error.status = 404
        throw error
      }

      // Provide the task document to req.
      req.doc = taskDoc

      logger.silly('Loaded task document', { id })

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Displays a list of all tasks.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index(req, res, next) {
    try {
      logger.silly('Loading all TaskModel documents')

      const viewData = {
        tasks: (await TaskModel.find())
          .map(taskDoc => taskDoc.toObject())
      }

      logger.silly('Loaded all TaskModel documents')

      res.render('tasks/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns a HTML form for creating a new task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async create(req, res) {
    res.render('tasks/create')
  }

  /**
   * Creates a new task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async createPost(req, res) {
    try {
      logger.silly('Creating new task document', { body: req.body })

      const { description, done } = req.body

      const task = await TaskModel.create({
        description,
        done: done === 'on'
      })

      // Publish the task to RabbitMQ
      await this.#publishToQueue({
        event: 'created',
        task: task.description,
        user: "am224wd" 
      })

      logger.silly('Created new task document')

      req.session.flash = { type: 'success', text: 'The task was created successfully.' }
      res.redirect('.')
    } catch (error) {
      this.#handleErrorAndRedirect(error, req, res, './create')
    }
  }

  async #publishToQueue(message) {
    const RABBITMQ_URL= 'amqp://rabbitmq:5672'
    const QUEUE_NAME = 'task_queue'

    try {
      const connection = await amqp.connect(RABBITMQ_URL)
      const channel = await connection.createChannel()
      await channel.assertQueue(QUEUE_NAME, { durable: true })

      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)))
      logger.silly(`Message sent to queue: ${JSON.stringify(message)}`)

      await channel.close()
      await connection.close()
    } catch (error) {
      logger.error('Error in publishing message to RabbitMQ', { error });
    }
  }

  /**
   * Returns a HTML form for updating a task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async update(req, res) {
    try {
      res.render('tasks/update', { viewData: req.doc.toObject() })
    } catch (error) {
      this.#handleErrorAndRedirect(error, req, res, '..')
    }
  }

  /**
   * Updates a specific task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePost(req, res) {
    try {
      logger.silly('Updating task document', { id: req.doc.id, body: req.body })

      if ('description' in req.body) req.doc.description = req.body.description
      req.doc.done = req.body.done === 'on' // default to false

      if (req.doc.isModified()) {
        await req.doc.save()
        logger.silly('Updated task document', { id: req.doc.id })

        // Publish the task to RabbitMQ
        await this.#publishToQueue({
          event: req.doc.done ? 'completed' : 'uncompleted',
          task: req.doc.description,
          user: "am224wd"
        })

        req.session.flash = { type: 'success', text: 'The task was updated successfully.' }
      } else {
        logger.silly('Unnecessary to update task document', { id: req.doc.id })
        req.session.flash = { type: 'info', text: 'The task was not updated because there was nothing to update.' }
      }
      res.redirect('..')
    } catch (error) {
      this.#handleErrorAndRedirect(error, req, res, './update')
    }
  }

  /**
   * Returns a HTML form for deleting a task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async delete(req, res) {
    try {
      res.render('tasks/delete', { viewData: req.doc.toObject() })
    } catch (error) {
      this.#handleErrorAndRedirect(error, req, res, '..')
    }
  }

  /**
   * Deletes the specified task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deletePost(req, res) {
    try {
      logger.silly('Deleting task document', { id: req.doc.id })

      await req.doc.deleteOne()

      logger.silly('Deleted task document', { id: req.doc.id })

      // Publish the task to RabbitMQ
      await this.#publishToQueue({
        event: 'deleted',
        task: req.doc.description,
        user: 'am224wd'
      })

      req.session.flash = { type: 'success', text: 'The task was deleted successfully.' }
      res.redirect('..')
    } catch (error) {
      this.#handleErrorAndRedirect(error, req, res, './delete')
    }
  }

  /**
   * Handles an error and redirects to the specified path.
   *
   * @param {Error} error - The error to handle.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {string} path - The path to redirect to.
   */
  #handleErrorAndRedirect(error, req, res, path) {
    logger.error(error.message, { error })
    req.session.flash = { type: 'danger', text: error.message }
    res.redirect(path)
  }
}
