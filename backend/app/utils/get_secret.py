import json
import boto3
from botocore.exceptions import ClientError


def get_secret(secret_name, region_name='us-west-2'):
    """
    Fetch a secret from AWS Secrets Manager and parse the JSON response.

    :param secret_name: Name of the secret in AWS Secrets Manager
    :param region_name: AWS region where the secret is stored
    :return: Dictionary containing the secret keys and values
    """
    # Create a Secrets Manager client
    client = boto3.client('secretsmanager', region_name=region_name)

    try:
        # Retrieve the secret value
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        # Handle the exception and raise it
        raise e

    # Decrypts secret using the associated KMS key.
    if 'SecretString' in get_secret_value_response:
        secret = get_secret_value_response['SecretString']
    else:
        secret = get_secret_value_response['SecretBinary']

    # Return the secret as a dictionary
    return json.loads(secret)
